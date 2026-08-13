import { DataHelper } from "../../helpers/data.mjs";
import { OUTSIDE_THE_WIRE } from "../../config/_outside-the-wire.mjs";

export default class OutsideTheWireActorBase extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ["OUTSIDE_THE_WIRE.Actor.base"];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.attributes = new fields.SchemaField(
      Object.keys(OUTSIDE_THE_WIRE.ACTOR.ATTRIBUTE).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({
            ...DataHelper.requiredInteger,
            initial: 2,
            min: 0,
            max: 12
          }),
        });
        return obj;
      }, {})
    );

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    const bonuses = this.parent.appliedEffects.reduce((acc, effect) => {
      if (effect.changes && !effect.disabled) {
        effect.changes.forEach(change => {
          const propertyKey = change.key.replace("bonus.", "");
          if (!(propertyKey in acc))
            acc[propertyKey] = {};
          let value = change.value;
          if (!isNaN(value))
            value = parseInt(value);
          let parentName = effect.parent.name;
          if (effect.parent.uuid == this.parent.uuid)
            parentName = effect.name;
          acc[propertyKey][parentName] = value;
        });
      }
      return acc;
    }, {});
    this.bonuses = bonuses;
  }

  EMBED_TEMPLATE = "systems/outside-the-wire/templates/embeds/actor.hbs";

  async prepareItems(context) {
    const powers = {};
    const gear = [];
    const injuries = [];
    const talents = [];
    const drawbacks = [];
    const boosts = {};
    const limits = {};

    const powerSources = this.parent.items.filter(i => i.type === "powerSource");
    const others = this.parent.items.filter(i => i.type !== "powerSource");
    for (const ps of powerSources) {
      ps.enriched = await this._enrich(ps.system.description);
      powers[ps.id] = {
        powerSource: ps,
        powers: []
      };
    }

    function getPowerSourceId(power) {
      if (power.system.powerSource) return power.system.powerSource;
      if (powerSources.length) return powerSources[0].id;

      let dummyPowerSource = {
        id: 0,
        name: '(No Power Source selected)'
      };

      powerSources.push(dummyPowerSource);
      powers[dummyPowerSource.id] = {
        powerSource: dummyPowerSource,
        powers: []
      };

      return dummyPowerSource.id;
    }


    // Iterate through items, allocating to containers
    for (let i of others) {
      i.enriched = await this._enrich(i.system.description);

      if (i.type === "power") {
        powers[getPowerSourceId(i)].powers.push(i);
        continue;
      }
      if (i.type === "criticalInjury") {
        injuries.push(i);
        continue;
      }
      if (i.type === "talent") {
        talents.push(i);
        continue;
      }
      if (i.type === "drawback") {
        drawbacks.push(i);
        continue;
      }
      if (i.type == "boost") {
        boosts[i.system.power] ??= [];
        boosts[i.system.power].push(i);
        continue;
      }
      if (i.type == "limit") {
        limits[i.system.power] ??= [];
        limits[i.system.power].push(i);
        continue;
      }
      if (i.type == "gear") {
        gear.push(i);
        continue;
      }
    }

    for (const [key, value] of Object.entries(powers)) {
      powers[key].powers = value.powers.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    }

    // Sort then assign
    context.powers = Object.values(powers).sort((a, b) => (a.powerSource.sort || 0) - (b.powerSource.sort || 0));
    context.injuries = injuries.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.talents = talents.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.drawbacks = drawbacks.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.gear = gear.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.boosts = boosts;
    context.limits = limits;
  }

  async _enrich(text, relativeTo = this.parent) {
    return await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      text,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.parent.isOwner,
        // Data to fill in for inline rolls
        rollData: this.parent.getRollData(),
        // Relative UUID resolution
        relativeTo: relativeTo,
      }
    );
  }

  async toEmbed(config, options = {}) {
    config.hideReputation = config.values.indexOf("hideReputation") > -1;
    config.hideImg = config.values.indexOf("hideImg") > -1;
    const context = {
      actor: this.parent,
      options,
      config
    }
    await this.prepareItems(context);
    const content = await foundry.applications.handlebars.renderTemplate(this.EMBED_TEMPLATE, context);
    const result = document.createElement("div");
    result.innerHTML = content;
    return result.firstChild;
  }

  async checkIfBroken(title) {
    let stopRoll = false;
    let message = "brokenBy";
    if (this.derived.health.max > 0 && this.derived.health.value == 0)
      message += "Damage";
    if (this.derived.resolve.max > 0 && this.derived.resolve.value == 0)
      message += "AndStress";
    message = message.replace("ByAnd", "By");

    if (message != "brokenBy") {
      stopRoll = !(await foundry.applications.api.DialogV2.confirm({
        window: { title },
        content: `<p>${game.i18n.localize(`OUTSIDE_THE_WIRE.Roll.${message}`)}</p>`,
        modal: true,
        rejectClose: false,
        classes: ['roll-application'],
      }));
    }

    if (stopRoll)
      throw new Error("Actor broken. Execution interrupted.")
  }
}
