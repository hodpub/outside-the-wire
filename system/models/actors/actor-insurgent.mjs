import OutsideTheWireSoldier from "./actor-soldier.mjs";

export default class OutsideTheWireInsurgent extends OutsideTheWireSoldier {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    for (const element of Object.keys(schema.attributes.fields)) {
      schema.attributes.fields[element].fields.value.min = 0;
      schema.attributes.fields[element].fields.value.initial = 0;
    }

    for (const element of Object.keys(schema.abilities.fields)) {
      schema.abilities.fields[element].fields.value.max = 20;
    }

    for (const element of Object.keys(schema.skills.fields)) {
      schema.skills.fields[element].fields.value.max = 20;
    }

    return schema;
  }
}