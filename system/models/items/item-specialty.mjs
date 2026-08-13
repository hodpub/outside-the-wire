import { extractTextFromHtml } from "../../helpers/utils.mjs";
import OutsideTheWireBonusItem from "./base-bonus-item.mjs";

export default class OutsideTheWireItemSpecialty extends OutsideTheWireBonusItem {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'OUTSIDE_THE_WIRE.Item.Specialty',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.initial = new fields.BooleanField({ initial: true, gmOnly: true });
    schema.hookTable = new fields.DocumentUUIDField({ type: "RollTable", gmOnly: true });
    schema.active = new fields.BooleanField({ initial: true });
    schema.usedHook = new fields.BooleanField({ initial: false });

    return schema;
  }

  //TODO: add logic to roll hook table when creating it on an actor
  //TODO: add logic to check if player already has another specialty

  async convertToSof() {
    let highestSkillValue = 0;
    let highestSkillName = null;
    for (const skillName of Object.keys(this.skills)) {
      if (this.skills[skillName].value <= highestSkillValue)
        continue;

      highestSkillValue = this.skills[skillName].value;
      highestSkillName = skillName;
    }
    highestSkillValue++;
    await this.parent.update({
      name: `SOF ${this.parent.name}`,
      [`system.skills.${highestSkillName}.value`]: highestSkillValue,
      "system.rank.value": 1
    });
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    if (!this.parent.isEmbedded)
      return;

    if (this.initial && this.parent.actor.items.filter(it => it.type == "specialty" && it.system.initial).length) {
      ui.notifications.error("This actor already has a initial specialty");
      return false;
    }

    if (!this.hookTable)
      return;

    if (await foundry.applications.api.DialogV2.confirm({
      content: `Do you want to roll the "${data.name}" hook table for this soldier? If yes, it will replace the current hook, if they have one.`,
      rejectClose: false,
      modal: true
    })) {
      const table = await fromUuid(this.hookTable);
      const result = await table.draw();
      const hook = extractTextFromHtml(result.results[0].description);
      await this.parent.actor.update({ "system.hook": hook });
      this.parent.updateSource({ "system.usedHook": true });
    }
  }
}