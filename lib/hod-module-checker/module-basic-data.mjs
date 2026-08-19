import ModuleChecker from "./module-checker.mjs";

export default class ModuleBasicData extends ModuleChecker {
  constructor(data) {
    super(data);
    this.adventureUuid = data.adventureUuid;
    this.importWelcomePage = data.importWelcomePage;
  }

  registerSettings() {
    super.registerSettings();
    game.settings.register(this.moduleId, "basicDataImported", {
      name: "Basic Data Imported",
      scope: "world",
      config: false,
      type: Boolean,
      default: false,
    });
  }

  async check() {
    if (!game.user.isGM)
      return;
    const imported = game.settings.get(this.moduleId, "basicDataImported");

    if (!imported) {
      const basicData = await fromUuid(this.adventureUuid);
      await basicData?.import();
      await game.settings.set(this.moduleId, "basicDataImported", true);
    }

    if (!this.isNewer)
      return;

    if (this.importWelcomePage) {
      const welcomePage = await fromUuid(this.welcomePage);
      const pack = game.packs.get(welcomePage.pack);
      const idToImport = welcomePage.documentName == "JournalEntryPage" ? welcomePage.parent.id : welcomePage.id;
      console.log(pack, welcomePage, idToImport);
      const options = { keepId: true };
      game.journal.importFromCompendium(pack, idToImport, null, options);
    }

    await super.check();
  }
}