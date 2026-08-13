import OutsideTheWireBonusItem from "./base-bonus-item.mjs";
import { OUTSIDE_THE_WIRE } from "../../config/_outside-the-wire.mjs";

export default class OutsideTheWireItemDeployment extends OutsideTheWireBonusItem {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'OUTSIDE_THE_WIRE.Item.Deployment',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.combatExperience.fields.value.initial = 1;

    schema.tour = new fields.StringField();
    schema.location = new fields.StringField();
    schema.awards = new fields.StringField();
    schema.school = new fields.DocumentUUIDField({ required: false, nullable: true });
    schema.schoolName = new fields.StringField();
    schema.survival = new fields.StringField();

    return schema;
  }

  async updateBasedOnItem(item, render = true) {
    if (!this.parent.isEmbedded)
      return ui.notifications.error("You can't add detail to a deployment that is not inside an actor.");

    if (item.type == "school") {
      debugger;
      const school = await Item.implementation.create(item, { parent: this.parent.actor, keepId: true });
      return this.parent.update({ "system.school": school.uuid, "system.schoolName": school.name });
    }

    if (item.type != "deploymentDetail")
      return ui.notifications.error("Deployment only accepts Deployment Detail items.");

    if (this[item.system.type]) {
      return ui.notifications.error(`This Deployment already have the ${game.i18n.localize("OUTSIDE_THE_WIRE.Item.Deployment.FIELDS." + item.system.type + ".label")}. Remove it before trying to add a new one.`);
    }

    const updates = { [`system.${item.system.type}`]: item.name };
    for (const attribute of Object.keys(OUTSIDE_THE_WIRE.ACTOR.ATTRIBUTE)) {
      if (!item.system.attributes[attribute].value)
        continue;

      updates[`system.attributes.${attribute}.value`] = this.attributes[attribute].value + item.system.attributes[attribute].value;
    }
    for (const ability of Object.keys(OUTSIDE_THE_WIRE.ACTOR.ABILITIES)) {
      if (!item.system.abilities[ability].value)
        continue;

      updates[`system.abilities.${ability}.value`] = this.abilities[ability].value + item.system.abilities[ability].value;
    }
    for (const skill of Object.keys(OUTSIDE_THE_WIRE.ACTOR.SKILL)) {
      if (!item.system.skills[skill].value)
        continue;

      updates[`system.skills.${skill}.value`] = this.skills[skill].value + item.system.skills[skill].value;
    }
    for (const extra of ["trainingExperience", "combatExperience", "rank"]) {
      if (!item.system[extra].value)
        continue;

      updates[`system.${extra}.value`] = this[extra].value + item.system[extra].value;
    }

    await this.parent.update(updates);
    if (render)
      return this.parent.actor.sheet.render(true);
  }
}