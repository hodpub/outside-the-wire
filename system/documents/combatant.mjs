import OtwRoll from "./roll.mjs";

export default class OtwCombatant extends foundry.documents.Combatant {
  async rollInitiative(formula) {
    if (this.isNPC)
      return this.update({ initiative: 50 });

    const roll = await new OtwRoll("2d10", this.actor.system.abilities.tactics.total, 0).roll();
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    roll.toMessage({
      speaker,
      flavor: "Initiative!"
    });
    const initiative = (roll.resultType == "success" ? 100 : 0) + this.actor.system.abilities.tactics.total;
    return this.update({ initiative: initiative });
  }
}