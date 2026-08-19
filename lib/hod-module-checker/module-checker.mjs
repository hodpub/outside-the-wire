/**
 * Class to check and manage module settings and states.
 * Version 1.5.0
 * @author CussaMitre (https://hodpub.com | https://github.com/CussaMitre)
 */
export default class ModuleChecker {
  constructor(data) {
    this.moduleId = data.moduleId;
    this.welcomePage = data.welcomePage;
    this.changelogPage = data.changelogPage;
    this.worldBackground = data.worldBackground;
    this.worldDescription = data.worldDescription;
    this.sceneToActivate = data.sceneToActivate;
    this.extraChecks = data.extraChecks;
    this.version = data.version;
    this.isModule = !data.isSystem;
  }

  _setting(name) {
    return name;
  }

  async _displayName() {
    return this.moduleName;
  }

  get welcomeShowed() {
    return game.settings.get(this.moduleId, this._setting("welcomePage"));
  }
  get currentVersion() {
    return game.settings.get(this.moduleId, this._setting("version"));
  }
  get module() {
    if (!this.isModule)
      return game.system;
    if (this._modulePack)
      return this._modulePack;
    this._modulePack = game.modules.get(this.moduleId);
    return this._modulePack;
  }
  get moduleVersion() {
    return this.version ?? this.module.version;
  }
  get moduleName() {
    return this.module.title;
  }
  get worldBackgroundChanged() {
    return game.settings.get(this.moduleId, this._setting("worldBackground"));
  }
  get isNewer() {
    return foundry.utils.isNewerVersion(this.moduleVersion, this.currentVersion);
  }

  registerSettings() {
    game.settings.register(this.moduleId, this._setting("welcomePage"), {
      name: "Showed the Welcome Page",
      scope: "world",
      config: false,
      type: Boolean,
      default: false,
    });
    game.settings.register(this.moduleId, this._setting("version"), {
      name: "Module Version",
      scope: "world",
      config: false,
      type: String,
      default: "0.0.0",
    });
    game.settings.register(this.moduleId, this._setting("worldBackground"), {
      name: "World Background",
      scope: "world",
      config: false,
      type: Boolean,
      default: false,
    });
  }

  static async displayJournal(journalId) {
    const journal = await fromUuid(journalId);
    if (journal.documentName == "JournalEntryPage")
      journal.parent.sheet.render(true, { pageId: journal.id });
    else
      await journal.sheet.render(true);
  }

  async changeWorldBackground() {
    const worldData = {
      action: "editWorld",
      id: game.world.id
    };
    if (this.worldDescription) {
      worldData.description = this.worldDescription;
    }
    if (this.worldBackground)
      worldData.background = `modules/${this.moduleId}/${this.worldBackground}`;
    await foundry.utils.fetchJsonWithTimeout(foundry.utils.getRoute("setup"), {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(worldData)
    });
    game.world.updateSource(worldData);
  }

  async checkChangelog() {
    if (!this.welcomeShowed ||
      !this.changelogPage ||
      !this.isNewer)
      return;

    await ModuleChecker.displayJournal(this.changelogPage);
  }

  async checkWelcomePage() {
    if (this.welcomeShowed ||
      !this.welcomePage)
      return;

    await ModuleChecker.displayJournal(this.welcomePage);
    await game.settings.set(this.moduleId, this._setting("welcomePage"), true);
  }

  async checkWorldBackground() {
    if (!this.worldBackgroundChanged && (this.worldBackground || this.worldDescription)) {
      const content = `<p>Do you want to update the world to the <strong>${await this._displayName()}</strong> background/description?</p>`;
      await foundry.applications.api.DialogV2.confirm(
        {
          content,
          yes: {
            callback: async () => {
              await this.changeWorldBackground();
              await game.settings.set(this.moduleId, this._setting("worldBackground"), true);
            }
          },
          window: {
            icon: "fa-solid fa-question",
            title: `Update world Background?`
          }
        }
      );

    }
  }

  async activateScene() {
    if (!this.sceneToActivate)
      return;
    const scene = await fromUuid(this.sceneToActivate);
    if (!scene)
      return;
    if (game.scenes.active && game.scenes.active.id === scene.id)
      return;
    await scene.activate();
  }

  async check() {
    if (!game.user.isGM)
      return;

    await Promise.all([
      this.checkChangelog(),
      this.checkWelcomePage(),
      this.checkWorldBackground(),
      this.activateScene(),
      this.extraChecks?.(),
    ]);

    await game.settings.set(this.moduleId, this._setting("version"), this.moduleVersion);
  }
}