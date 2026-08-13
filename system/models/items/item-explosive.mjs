import { OUTSIDE_THE_WIRE } from "../../config/_outside-the-wire.mjs";
import { rollDamage } from "../../helpers/rolls.mjs";
import OutsideTheWireItemEquipment from "./item-equipment.mjs";

export default class OutsideTheWireItemExplosive extends OutsideTheWireItemEquipment {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.type = new fields.StringField({ required: true, initial: "explosives" });
    schema.usable.initial = true;
    schema.test.initial = "skills.explosives.total";

    return schema;
  }

  async use(roll) {
    await super.use();
    if (roll.resultType == "success")
      await rollDamage(roll.options.messageMode, this.parent.actor);
  }
}