export default class OutsideTheWireItemBase extends foundry.abstract
  .TypeDataModel {
  static LOCALIZATION_PREFIXES = [
    'OUTSIDE_THE_WIRE.Item.base',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.HTMLField();

    // schema.automations = new fields.TypedObjectField(new fields.TypedSchemaField(outsideTheWire.automations.BaseAutomation.TYPES));

    return schema;
  }

  get chatTemplate() {
    return "systems/outside-the-wire/templates/sidebar/chat/item.hbs";
  };
}
