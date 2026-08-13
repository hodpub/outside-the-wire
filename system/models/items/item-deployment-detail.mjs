import OutsideTheWireBonusItem from "./base-bonus-item.mjs";
import { OUTSIDE_THE_WIRE } from "../../config/_outside-the-wire.mjs";

export default class OutsideTheWireItemDeploymentDetail extends OutsideTheWireBonusItem {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'OUTSIDE_THE_WIRE.Item.DeploymentDetail',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.type = new fields.StringField({ required: true, choices: OUTSIDE_THE_WIRE.ITEMS.DEPLOYMENT_DETAIL_TYPE_CHOICES, initial: OUTSIDE_THE_WIRE.ITEMS.DEPLOYMENT_DETAIL_TYPE.location });

    return schema;
  }
}