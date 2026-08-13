import { OUTSIDE_THE_WIRE } from "../../config/_outside-the-wire.mjs";
import { rollDamage } from "../../helpers/rolls.mjs";
import OutsideTheWireItemEquipment from "./item-equipment.mjs";

export default class OutsideTheWireItemWeapon extends OutsideTheWireItemEquipment {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'OUTSIDE_THE_WIRE.Item.Weapon',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.type = new fields.StringField({ choices: OUTSIDE_THE_WIRE.EQUIPMENT.WEAPONS_TYPE, required: true, initial: OUTSIDE_THE_WIRE.EQUIPMENT.WEAPONS_TYPE.pistol });
    schema.usable.initial = true;
    schema.attachments = new fields.SetField(new fields.StringField());

    return schema;
  }

  async use(roll) {
    await super.use();
    if (roll.resultType == "success")
      await rollDamage(roll.options.messageMode, this.parent.actor);
  }
}