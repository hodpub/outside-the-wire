import OutsideTheWireBonusItem from "./base-bonus-item.mjs";

export default class OutsideTheWireItemSchool extends OutsideTheWireBonusItem {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'OUTSIDE_THE_WIRE.Item.School',
  ];
}