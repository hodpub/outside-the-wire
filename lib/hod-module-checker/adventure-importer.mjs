import ModuleChecker from "./module-checker.mjs";

export default class AdventureImporter extends ModuleChecker {
  constructor(data) {
    super(data);
    this.adventureUuid = data.adventureUuid;
    this.settingName = data.settingName;
  }

  _setting(name) {
    return `${this.settingName}_${name}`;
  }

  async _adventure() {
    if (!this._adventureCache)
      this._adventureCache = await fromUuid(this.adventureUuid);
    return this._adventureCache;
  }

  async _displayName() {
    const adventure = await this._adventure();
    return adventure.name;
  }

  get shouldShowImporter() {
    const lastImporterVersion = game.settings.get(this.moduleId, this._setting("adventureShowed"));
    return foundry.utils.isNewerVersion(this.moduleVersion, lastImporterVersion);
  }

  registerSettings() {
    super.registerSettings();
    game.settings.register(this.moduleId, this._setting("adventureShowed"), {
      name: "Version Adventure Import Showed",
      scope: "world",
      config: false,
      type: String,
      default: "0.0.0",
    });
  }

  async check() {
    if (!game.user.isGM)
      return;
    if (!this.isNewer)
      return;
    if (!this.shouldShowImporter)
      return;

    game.settings.set(this.moduleId, this._setting("adventureShowed"), this.moduleVersion);
    const adventure = await this._adventure();
    adventure.sheet.render(true);
  }

  async checkIfImported(adventure) {
    if (adventure.uuid !== this.adventureUuid)
      return;

    await super.check();
  }
}