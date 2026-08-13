import OutsideTheWireRollDialog from "../applications/dialog/roll-dialog.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class OutsideTheWireItem extends Item {
  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const rollData = { ...this.system };

    // Quit early if there's no parent actor
    if (!this.actor) return rollData;

    // If present, add the actor's roll data
    rollData.actor = this.actor.getRollData();

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll(event) {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const messageMode = game.settings.get("core", "messageMode");
    const itemType = game.i18n.localize(`OUTSIDE_THE_WIRE.Item.Equipment.FIELDS.type.${item.system.type}.label`);
    let label = `[${itemType}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.test) {
      return foundry.documents.ChatMessage.create({
        speaker: speaker,
        messageMode: messageMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    }

    const canUse = await this.system.canUse?.() ?? true;
    if (!canUse)
      return ui.notifications.error("You can't use this item.");

    let testLocalization = this.system.test.replace(".total", "");
    testLocalization = testLocalization.charAt(0).toUpperCase() + testLocalization.slice(1);
    const testName = game.i18n.localize(`OUTSIDE_THE_WIRE.${testLocalization}`);
    label = `[${itemType}] ${item.name} (${testName})`;

    // Otherwise, create a roll and send a chat message from it.
    const target = foundry.utils.getProperty(this.actor.system, this.system.test);
    const result = await new OutsideTheWireRollDialog(label, target, { actor: this.actor }).wait(event);
    const roll = result.rolls[0];
    await this.system.use?.(roll);
    return result;
  }

  static getDefaultArtwork(itemData) {
    return { img: `systems/outside-the-wire/assets/icons/${itemData.type.toLowerCase()}.svg` };
  }
}
