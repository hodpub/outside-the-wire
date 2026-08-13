import { OUTSIDE_THE_WIRE } from "../../config/_outside-the-wire.mjs";
import { DataHelper } from "../../helpers/data.mjs";
import OutsideTheWireActor from './base-actor.mjs';

export default class OutsideTheWireSoldier extends OutsideTheWireActor {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'OUTSIDE_THE_WIRE.Actor.Soldier',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.nickname = new fields.StringField({ required: true, blank: true });
    schema.age = new fields.SchemaField({
      value: new fields.NumberField({ ...DataHelper.requiredInteger, initial: 17, min: 17, max: 30 })
    });
    schema.tours = new fields.NumberField({ ...DataHelper.requiredInteger, min: 0, initial: 0 });
    //background will be items
    schema.biography = new fields.StringField();
    schema.nationality = new fields.StringField({ required: true, choices: OUTSIDE_THE_WIRE.ACTOR.NATIONALITY, initial: OUTSIDE_THE_WIRE.ACTOR.NATIONALITY.USA }); //TODO: add options?
    schema.physicalDescription = new fields.StringField();
    schema.height = new fields.StringField({ required: true, blank: true }); // using string because of different types of units
    schema.weight = new fields.StringField({ required: true, blank: true }); // using string because of different types of units
    schema.languages = new fields.SetField(new fields.StringField());
    schema.motivation = new fields.StringField({ required: true, blank: true });
    schema.trademark = new fields.StringField({ required: true, blank: true });
    schema.hook = new fields.StringField({ required: true, blank: true });
    schema.conflict = new fields.StringField({ required: true, blank: true });

    schema.serviceBranch = new fields.StringField({ required: true, choices: OUTSIDE_THE_WIRE.ACTOR.SERVICE_BRANCHE_CHOICES, initial: OUTSIDE_THE_WIRE.ACTOR.SERVICE_BRANCHE.army });
    schema.initialRank = new fields.NumberField({ required: true, initial: 0 });

    schema.combatExperience = new fields.SchemaField({
      value: new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0 })
    });
    schema.trainingExperience = new fields.SchemaField({
      value: new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0 })
    });

    /* Removed from the latest character sheet
    schema.skinToken = new fields.StringField();
    schema.hairStyle = new fields.StringField();
    schema.eyeColor = new fields.StringField();
    schema.scar = new fields.StringField();
    */

    schema.attributes = new fields.SchemaField(
      Object.keys(OUTSIDE_THE_WIRE.ACTOR.ATTRIBUTE).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({
            ...DataHelper.requiredInteger,
            initial: 4,
            min: 1,
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

    schema.health = new fields.SchemaField({
      stun: new fields.BooleanField(),
      mobility: new fields.BooleanField(),
      mobilityArm: new fields.BooleanField(),
      mobilityLeg: new fields.BooleanField(),
      unconscious: new fields.BooleanField(),
      dead: new fields.BooleanField(),
    });

    schema.editMode = new fields.BooleanField({ initial: true });

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    for (const attribute of Object.keys(OUTSIDE_THE_WIRE.ACTOR.ATTRIBUTE)) {
      this.attributes[attribute].total = this.attributes[attribute].value + (this.attributes[attribute].bonus ?? 0);
    }
    for (const ability of Object.keys(OUTSIDE_THE_WIRE.ACTOR.ABILITIES)) {
      this.abilities[ability].total = this.abilities[ability].value + (this.abilities[ability].bonus ?? 0);
    }
    for (const extra of ["trainingExperience", "combatExperience"])
      this[extra].total = this[extra].value + (this[extra].bonus ?? 0);
    for (const element of Object.keys(OUTSIDE_THE_WIRE.ACTOR.SKILL))
      this.skills[element].total = 0;

    this.age.total = this.age.value + (this.tours * 4);

    this.isOfficer = this.initialRank >= 100;
    this.rank = { total: "", value: this.initialRank % 100 };
    const serviceBranchInfo = (OUTSIDE_THE_WIRE.RANKS[this.nationality] ?? OUTSIDE_THE_WIRE.RANKS.default);
    this.sergeant = {
      index: serviceBranchInfo.sergeant,
      maxEnlisted: serviceBranchInfo.default.false.length - 1,
      maxOfficer: serviceBranchInfo.default.true.length - 1,
    };
    this.trainingExperience.total = Math.max(0, this.rank.value - (this.sergeant.index - 1));
    const items = this.parent.items.contents.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    for (const item of items) {
      for (const attribute of Object.keys(OUTSIDE_THE_WIRE.ACTOR.ATTRIBUTE)) {
        this.attributes[attribute].total += item.system.attributes[attribute].value;
      }
      for (const ability of Object.keys(OUTSIDE_THE_WIRE.ACTOR.ABILITIES)) {
        this.abilities[ability].total += item.system.abilities[ability].value;
      }
      for (const skill of Object.keys(OUTSIDE_THE_WIRE.ACTOR.SKILL)) {
        this.skills[skill].total += item.system.skills[skill].value;
      }
      for (const extra of ["trainingExperience", "combatExperience"])
        this[extra].total += item.system[extra].value;

      this.handleRankPromotion(item.system.rank.value);
    }
    this.rank.total = this.getFinalRank();

    this.abilities.prowess.total += this.attributes.strength.total + this.trainingExperience.total + this.combatExperience.total;
    this.abilities.tactics.total += this.attributes.knowledge.total + this.trainingExperience.total + this.combatExperience.total;
    this.abilities.instincts.total += this.attributes.wisdom.total + this.trainingExperience.total + this.combatExperience.total;
    this.abilities.shooting.total += this.attributes.agility.total + this.combatExperience.total;

    for (const element of ["smallArms", "heavyArms"]) {
      this.skills[element].total += this.skills[element].value + (this.skills[element].bonus ?? 0);
      let finalTotal = this.skills[element].total;
      if (this.skills[element].total == 0)
        finalTotal += this.abilities.shooting.total / 2;
      else
        finalTotal += this.abilities.shooting.total;
      finalTotal = Math.floor(finalTotal);
      this.skills[element].total = finalTotal;
    }

    for (const element of Object.keys(OUTSIDE_THE_WIRE.ACTOR.SKILL)) {
      if (["smallArms", "heavyArms"].indexOf(element) > -1)
        continue;
      this.skills[element].total += this.skills[element].value + (this.skills[element].bonus ?? 0);
      let abilityBonus = this.attributes.wisdom.total + this.combatExperience.total;
      let finalTotal = this.skills[element].total;
      if (this.skills[element].total == 0)
        finalTotal += abilityBonus / 2;
      else
        finalTotal += abilityBonus;
      finalTotal = Math.floor(finalTotal);
      this.skills[element].total = finalTotal;
    }
  }

  handleRankPromotion(promotionType) {
    if (promotionType == 0)
      return;

    if (promotionType == 1) {
      if (this.rank.value >= this.sergeant.maxEnlisted)
        return;

      this.rank.value += 1;
      if (this.rank.value >= this.sergeant.index)
        this.trainingExperience.total += 1;

      return;
    }

    if (!this.isOfficer) {
      this.isOfficer = true;
      this.rank.value = -1;
    }
    else if (this.rank.value >= this.sergeant.maxOfficer)
      return;

    this.rank.value += 1;
    this.trainingExperience.total += 1;

  }

  getFinalRank() {
    let list = OUTSIDE_THE_WIRE.RANKS[this.nationality] ?? OUTSIDE_THE_WIRE.RANKS.default;
    list = list[this.serviceBranch] ?? list.default;
    list = list[this.isOfficer];
    const index = Math.min(this.rank.value, list.length - 1);
    return list[index];
  }

  async prepareItems(context) {
    const deployments = [];
    let background = null;
    const specialties = [];
    const loadout = {};

    for (const item of this.parent.items) {
      switch (item.type) {
        case "specialty":
          specialties.push(item);
          break;
        case "deployment":
        case "school":
          deployments.push(item);
          break;
        case "background":
          background = item;
          break;
        case "equipment":
        case "weapon":
        case "explosive":
          loadout[item.system.type] ??= [];
          loadout[item.system.type].push(item);
          break;
        default:
          break;
      }
    }

    context.services = [...specialties, ...deployments].sort((a, b) => a.sort - b.sort);
    if (background)
      context.services.unshift(background);
    for (const equipType of Object.keys(loadout)) {
      loadout[equipType] = loadout[equipType].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
    }
    context.loadout = loadout;
  }
}
