import OutsideTheWireBonusItem from "./base-bonus-item.mjs";
import { OUTSIDE_THE_WIRE } from "../../config/_outside-the-wire.mjs";

export default class OutsideTheWireItemEquipment extends OutsideTheWireBonusItem {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'OUTSIDE_THE_WIRE.Item.Equipment',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.type = new fields.StringField({ choices: OUTSIDE_THE_WIRE.EQUIPMENT.TYPE, required: true, initial: OUTSIDE_THE_WIRE.EQUIPMENT.TYPE.head });
    schema.usable = new fields.BooleanField({ initial: false });
    schema.quantity = new fields.NumberField({ integer: true, required: true, nullable: false, initial: 1, min: 0 });
    schema.test = new fields.StringField();

    return schema;
  }

  async canUse() {
    return !this.usable || this.quantity > 0;
  }

  async use() {
    if (this.usable)
      await this.parent.update({ "system.quantity": this.quantity - 1 });
  }
}