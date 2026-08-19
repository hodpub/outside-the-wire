import { MODULE_CONFIG } from "./module-config.mjs";
import AdventureImporter from "../lib/hod-module-checker/adventure-importer.mjs";

const adventureData = new AdventureImporter(MODULE_CONFIG);

Hooks.once('init', function() {
  adventureData.registerSettings();
});

Hooks.once("ready", async function() {
  const defautlScene = game.scenes.get("MSPzszYpzhC25qmh");
  if (!defautlScene)
    await adventureData.check();
});

Hooks.on('importAdventure', async (adventure) => {
  await adventureData.checkIfImported(adventure);
});