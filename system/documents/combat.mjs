export default class OtwCombat extends foundry.documents.Combat {
  async rollInitiative(ids, options = {}) {
    ids = Array.isArray(ids) ? ids : [ids];

    for (const id of ids) {
      const combatant = this.combatants.get(id);
      if (combatant) await combatant.rollInitiative(options.formula);
    }

    return this;
  }
}