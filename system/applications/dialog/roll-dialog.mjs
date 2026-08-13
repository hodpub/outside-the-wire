import OtwRoll from "../../documents/roll.mjs";

const { HandlebarsApplicationMixin, ApplicationV2, DialogV2 } = foundry.applications.api;
const TextEditor = foundry.applications.ux.TextEditor.implementation;

export default class OutsideTheWireRollDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(
    rollName,
    target,
    {
      actor,
      rollBonus = 0,
      targetBonus = 0,
    } = { actor: null, rollBonus: 0, targetBonus: 0, },
    options) {
    options ??= {};
    options.window ??= {};
    let title = actor ? `${actor.name} - ` : "";
    options.window.title = `${title}${rollName}`;
    super(options);
    this.rollName = rollName;
    this.target = target;
    this.actor = actor;
    this.rollBonus = rollBonus;
    this.targetBonus = targetBonus;
  }

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ['outside-the-wire', 'roll-dialog', 'standard-form'],
    position: {
      width: 600,
    },
    window: {
      icon: "fa-solid fa-dice",
      resizable: false
    },
    tag: "form",
    form: {
      handler: OutsideTheWireRollDialog.formHandler,
      submitOnChange: true,
    },
  };

  /** @inheritdoc */
  static PARTS = {
    form: {
      template: `systems/outside-the-wire/templates/applications/dialog/roll-dialog.hbs`,
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    }
  };


  async _prepareContext() {
    const buttonsList = Object.keys(CONFIG.ChatMessage.modes).filter(it => it != "ic").map(key => {
      const mode = CONFIG.ChatMessage.modes[key];
      return {
        type: "submit",
        icon: mode.icon,
        label: mode.label,
        action: key,
      };
    });
    const context = {
      buttons: buttonsList,
      actor: this.actor,
      rollBonus: this.rollBonus,
      targetBonus: this.targetBonus,
      rollName: this.rollName,
      target: this.target,
    };

    this.context = context;

    return context;
  }

  /**
   * Process form submission for the sheet
   * @this {OutsideTheWireRollDialog}                        The handler is called with the application as its bound scope
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {FormDataExtended} formData           Processed data for the submitted form
   * @returns {Promise<void>}
   */
  static async formHandler(event, form, formData) {
    return this._formHandler(event, form, formData);
  }

  async _formHandler(event, form, formData) {
    if (event.type == "change")
      return this._updateDialog(formData);

    if (event.type == "submit")
      return this._roll(event);

    console.error("Unhandled event type in OutsideTheWireRollDialog:", event.type);
    return;
  }

  async _updateDialog(formData) {
    const formValues = formData.object;
    this.rollBonus = formValues.rollBonus || 0;
    this.targetBonus = formValues.targetBonus || 0;
    this.render(true);
  }

  async _roll(event) {
    let formula = "2d10";
    const target = parseInt(this.target);
    const targetBonus = parseInt(this.targetBonus);
    if (this.rollBonus)
      formula += `+${this.rollBonus}`;
    const messageMode = event.submitter?.dataset.action ?? game.settings.get('core', 'messageMode');
    let roll = await new OtwRoll(formula, target, targetBonus, {}, { targetBonus: this.targetBonus, rollBonus: this.rollBonus, messageMode }).roll();
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const message = await roll.toMessage({
      speaker,
      flavor: this.rollName,
    }, { messageMode: messageMode });
    this.result = message;

    this.close();

    await game.dice3d?.waitFor3DAnimationByMessageID(message.id);
    return this.result;
  }

  async wait(event) {
    // await this.actor.system.checkIfBroken(this.options.window.title);

    if (event?.shiftKey) {
      event.submitter = {
        dataset: { action: game.settings.get('core', 'messageMode') }
      };
      await this._prepareContext();
      return this._roll({}, undefined, undefined);
    }

    return new Promise((resolve, _reject) => {
      this.addEventListener("close", async _event => {
        resolve(await this.result);
      }, { once: true });
      this.render(true);
    });
  }
}