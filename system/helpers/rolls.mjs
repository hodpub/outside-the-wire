export async function rollDamage(messageMode, actor) {
  const damageResolutionUuid = "Compendium.outside-the-wire.rolltables.RollTable.LfJtDBYPkJqBJ9NC";
  const damageResolutionTable = await fromUuid(damageResolutionUuid);

  const result = await damageResolutionTable.draw({ messageMode, displayChat: false });
  const messageData = {
    speaker: ChatMessage.getSpeaker({ actor })
  };
  result.toMessage(result.results, { messageData });
}