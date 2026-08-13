import OutsideTheWireItemBase from "./base-item.mjs";
import { DataHelper } from "../../helpers/data.mjs";
import { OUTSIDE_THE_WIRE } from "../../config/_outside-the-wire.mjs";

export default class OutsideTheWireBonusItem extends OutsideTheWireItemBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'OUTSIDE_THE_WIRE.Item.bonus',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.combatExperience = new fields.SchemaField({
      value: new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0 })
    });
    schema.trainingExperience = new fields.SchemaField({
      value: new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0 })
    });
    schema.rank = new fields.SchemaField({
      value: new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, choices: OUTSIDE_THE_WIRE.ITEMS.DEPLOYMENT_PROMOTION_CHOICES })
    });

    schema.attributes = new fields.SchemaField(
      Object.keys(OUTSIDE_THE_WIRE.ACTOR.ATTRIBUTE).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({
            ...DataHelper.requiredInteger,
            initial: 0,
            min: 0,
            max: 10
          })
        });
        return obj;
      }, {})
    );

    schema.abilities = new fields.SchemaField(
      Object.keys(OUTSIDE_THE_WIRE.ACTOR.ABILITIES).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({
            ...DataHelper.requiredInteger,
            initial: 0,
            min: 0,
            max: 10
          })
        });
        return obj;
      }, {})
    );

    schema.skills = new fields.SchemaField(
      Object.keys(OUTSIDE_THE_WIRE.ACTOR.SKILL).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({
            ...DataHelper.requiredInteger,
            initial: 0,
            min: 0,
            max: 10
          })
        });
        return obj;
      }, {})
    );

    return schema;
  }


  prepareDerivedData() {
    super.prepareDerivedData();

    const changes = [];
    for (const element of Object.keys(this.attributes)) {
      if (!this.attributes[element].value)
        continue;

      changes.push(`${game.i18n.localize("OUTSIDE_THE_WIRE.Attributes." + element)}: ${this.attributes[element].value}`);
    }
    for (const element of Object.keys(this.abilities)) {
      if (!this.abilities[element].value)
        continue;

      changes.push(`${game.i18n.localize("OUTSIDE_THE_WIRE.Abilities." + element)}: ${this.abilities[element].value}`);
    }
    for (const element of Object.keys(this.skills)) {
      if (!this.skills[element].value)
        continue;

      changes.push(`${game.i18n.localize("OUTSIDE_THE_WIRE.Skills." + element)}: ${this.skills[element].value}`);
    }
    this.changes = changes.join(", ");

    this.editMode = true;
  }
}
