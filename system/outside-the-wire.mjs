// Import document classes.
import { OutsideTheWireActor } from './documents/actor.mjs';
import { OutsideTheWireItem } from './documents/item.mjs';
import { OutsideTheWireChatMessage } from "./documents/chat-message.mjs";
// Import sheet classes.
import { OutsideTheWireActorSheet } from './sheets/actor-sheet.mjs';
import { OutsideTheWireItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { OUTSIDE_THE_WIRE } from './config/_outside-the-wire.mjs';
// Import DataModel classes
import * as models from './models/_models.mjs';
import registerHandlebarsHelpers from "./helpers/handlebars.mjs";
import { OutsideTheWireChatLog } from "./applications/sidebar/tabs/chatLog.mjs";
// import { registerDice3D } from "./helpers/rolls.mjs";
import OutsideTheWireRollDialog from "./applications/dialog/roll-dialog.mjs";
import OutsideTheWireCreatorDialog from "./applications/dialog/creator.mjs";
import { registerCreatorSettings } from "./applications/dialog/creator.mjs";
import { registerSettings } from "./helpers/settings.mjs";
import OtwRoll from "./documents/roll.mjs";
import { registerStatusEffects } from "./config/statusEffects.mjs";
import { registerEnricherActions, registerEnrichers, updateTrackByName } from "./helpers/enrichers.mjs";
import { openTrackSheet, registerSceneControls } from "./helpers/scene-controls.mjs";

import { HodLogger } from "../lib/hod-logger/logger.mjs";
import OtwCombatant from "./documents/combatant.mjs";
import OtwCombat from "./documents/combat.mjs";
import { OutsideTheWireItemTrackSheet } from "./sheets/item-track-sheet.mjs";

const collections = foundry.documents.collections;
const sheets = foundry.appv1.sheets;

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

// Add key classes to the global scope so they can be more easily used
// by downstream developers
globalThis.outsideTheWire = {
  documents: {
    OutsideTheWireActor,
    OutsideTheWireItem,
  },
  applications: {
    OutsideTheWireActorSheet,
    OutsideTheWireItemSheet,
  },
  actions: {
    openTrackSheet,
    updateTrackByName,
  },
  utils: {
    rollItemMacro,
    OutsideTheWireRollDialog,
    OutsideTheWireCreatorDialog
  },
  models,
};

globalThis.HodLogger = HodLogger;

HodLogger.configure({
  systemId: OUTSIDE_THE_WIRE.ID,
  logLevel: HodLogger.LOG_LEVEL.DEBUG
});

Hooks.once('init', function() {
  // Add custom constants for configuration.
  CONFIG.OUTSIDE_THE_WIRE = OUTSIDE_THE_WIRE;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20 + @abilities.dex.mod',
    decimals: 2,
  };

  CONFIG.ui.chat = OutsideTheWireChatLog;

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = OutsideTheWireActor;

  CONFIG.Actor.dataModels = {
    soldier: models.OutsideTheWireSoldier,
    insurgent: models.OutsideTheWireInsurgent,
  };
  CONFIG.Item.documentClass = OutsideTheWireItem;
  CONFIG.Item.dataModels = {
    specialty: models.OutsideTheWireItemSpecialty,
    school: models.OutsideTheWireItemSchool,
    deployment: models.OutsideTheWireItemDeployment,
    deploymentDetail: models.OutsideTheWireItemDeploymentDetail,
    background: models.OutsideTheWireItemBackground,
    equipment: models.OutsideTheWireItemEquipment,
    weapon: models.OutsideTheWireItemWeapon,
    explosive: models.OutsideTheWireItemExplosive,
    track: models.OutsideTheWireItemTrack,
  };

  CONFIG.ChatMessage.documentClass = OutsideTheWireChatMessage;
  CONFIG.ChatMessage.template = "systems/outside-the-wire/templates/sidebar/chat-message.hbs";
  CONFIG.Combat.documentClass = OtwCombat;
  CONFIG.Combatant.documentClass = OtwCombatant;
  CONFIG.Dice.rolls.push(OtwRoll);

  // Register sheet application classes
  foundry.documents.collections.Actors.registerSheet('outside-the-wire', OutsideTheWireActorSheet, {
    makeDefault: true,
    label: 'OUTSIDE_THE_WIRE.SheetLabels.Actor',
  });
  foundry.documents.collections.Items.registerSheet('outside-the-wire', OutsideTheWireItemSheet, {
    makeDefault: true,
    label: 'OUTSIDE_THE_WIRE.SheetLabels.Item',
  });

  foundry.documents.collections.Items.registerSheet('outside-the-wire', OutsideTheWireItemTrackSheet, {
    makeDefault: true,
    types: ["track"],
    label: 'OUTSIDE_THE_WIRE.SheetLabels.Item',
  });

  registerSettings();
  registerCreatorSettings();
  registerEnrichers();
  registerSceneControls();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

registerHandlebarsHelpers();

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function() {
  registerStatusEffects();
  registerEnricherActions();
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createDocMacro(data, slot));
  // adventureImport();
  models.OutsideTheWireItemTrack.checkIfHasTrack();
});

// const quickstartAdventureUuid = "Compendium.invincible.basic-data.Adventure.UPXxPs1B06jTxXq6";

// async function adventureImport() {
//   if (game.scenes.get("vL4Lqhd60r7UHjPT"))
//     return;

//   const adventure = await fromUuid(quickstartAdventureUuid);
//   adventure.sheet.render(true);
// }

// Hooks.on('importAdventure', async (adventure) => {
//   if (adventure.uuid !== quickstartAdventureUuid)
//     return;
//   const scene = await fromUuid("Scene.sge0EEkIG8wuvCmB");
//   scene.activate();
//   const journal = await fromUuid("JournalEntry.JYIKkkXpyqIM3IC0");
//   journal.sheet.render(true);
// });

// Hooks.once('diceSoNiceReady', registerDice3D);

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createDocMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.invincible.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'invincible.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
