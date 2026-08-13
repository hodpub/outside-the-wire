export default class OtwRoll extends foundry.dice.Roll {
  /**
   * @param {string} formula    The string formula to parse
   * @param {object} data       The data object against which to parse attributes within the formula
   * @param {RollOptions} [options]  Options modifying or describing the Roll
   */
  constructor(formula, target, targetBonus = 0, data = {}, options = {}) {
    super(formula, data, options);
    this.originalTarget = target;
    this.targetBonus = targetBonus;
  }

  /**
   * The HTML template path used to render a complete Roll object to the chat log
   * @type {string}
   */
  static CHAT_TEMPLATE = "systems/outside-the-wire/templates/dice/roll.hbs";
  static TOOLTIP_TEMPLATE = "systems/outside-the-wire/templates/dice/tooltip.hbs";

  /**
   * Clone the Roll instance, returning a new Roll instance that has not yet been evaluated.
   * @returns {OtwRoll}
   */
  clone() {
    return new this.constructor(this._formula, this.originalTarget, this.targetBonus, this.data, this.options);
  }

  get steps() {
    const counter = Math.abs(this.target - this.total);
    let steps = Math.floor(counter / 5);
    if (this.target < this.total)
      steps *= -1;
    return steps;
  }

  get resultType() {
    if (!this.target)
      return "";

    return (this.total < 20 && (this.total == 2 || this.total <= this.target)) ? "success" : "failure";
  }

  get target() {
    return this.originalTarget + this.targetBonus;
  }

  get fullFormula() {
    let bonus = this.targetBonus;
    if (bonus < 0)
      bonus = ` - ${Math.abs(bonus)}`;
    else if (bonus > 0)
      bonus = ` + ${Math.abs(bonus)}`;
    else
      bonus = "";
    return `${this.formula} <= ${this.originalTarget}${bonus}`;
  }

  /* -------------------------------------------- */
  /*  Static Class Methods                        */
  /* -------------------------------------------- */

  /**
   * A factory method which constructs a Roll instance using the default configured Roll class.
   * @param {string} formula        The formula used to create the Roll instance
   * @param {object} [data={}]      The data object which provides component data for the formula
   * @param {object} [options={}]   Additional options which modify or describe this Roll
   * @returns {Roll}                The constructed Roll instance
   */
  static create(formula, target, data = {}, options = {}) {
    const cls = CONFIG.Dice.rolls[1];
    return new cls(formula, target, data, options);
  }

  /* -------------------------------------------- */

  /**
   * Get the default configured Roll class.
   * @returns {typeof Roll}
   */
  static get defaultImplementation() {
    return CONFIG.Dice.rolls[1];
  }

  /**
   * Represent the data of the Roll as an object suitable for JSON serialization.
   * @returns {object}     Structured data which can be serialized into JSON
   */
  toJSON() {
    return foundry.utils.mergeObject(
      super.toJSON(),
      {
        target: this.originalTarget,
        targetBonus: this.targetBonus,
      }
    );
  }

  /**
     * Recreate a Roll instance using a provided data object
     * @param {object} data   Unpacked data representing the Roll
     * @returns {Roll}         A reconstructed Roll instance
     */
  static fromData(data) {
    const { DiceTerm, RollTerm } = foundry.dice.terms;

    // Redirect to the proper Roll class definition
    if (data.class && (data.class !== this.name)) {
      const cls = CONFIG.Dice.rolls.find(cls => cls.name === data.class);
      if (!cls) throw new Error(`Unable to recreate ${data.class} instance from provided data`);
      return cls.fromData(data);
    }

    // Create the Roll instance
    const roll = new this(data.formula, data.target, data.targetBonus, data.data, data.options);

    // Expand terms
    roll.terms = data.terms.map(t => {
      if (t.class) {
        if (t.class === "DicePool") t.class = "PoolTerm"; // Backwards compatibility
        if (t.class === "MathTerm") t.class = "FunctionTerm";
        return RollTerm.fromData(t);
      }
      return t;
    });

    // Repopulate evaluated state
    if (data.evaluated ?? true) {
      roll._total = data.total;
      roll._dice = (data.dice || []).map(t => DiceTerm.fromData(t));
      roll._evaluated = true;
    }
    return roll;
  }

  async _prepareChatRenderContext({ flavor, isPrivate = false, ...options } = {}) {
    let rollType = `roll-under ${this.resultType}`;

    const baseContext = await super._prepareChatRenderContext({ flavor, isPrivate, options });
    const result = foundry.utils.mergeObject(
      baseContext,
      {
        target: this.target,
        steps: this.steps,
        item: this.options.item,
        options: this.options,
        cssClass: rollType,
        isPrivate,
        fullFormula: this.fullFormula,
      }
    );
    return result;
  }

  /**
   * Render the tooltip HTML for a Roll instance
   * @returns {Promise<string>}     The rendered HTML tooltip as a string
   */
  async getTooltip() {
    const parts = this.dice.map(d => d.getTooltipData());
    return foundry.applications.handlebars.renderTemplate(this.constructor.TOOLTIP_TEMPLATE, {
      parts,
      targetBonus: this.signInt(this.options.targetBonus),
      rollBonus: this.signInt(this.options.rollBonus)
    });
  }

  signInt(int) {
    if (!int)
      return null;
    if (int <= 0)
      return int;
    return `+${int}`;
  }
}