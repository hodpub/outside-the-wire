export class OutsideTheWireChatLog extends foundry.applications.sidebar.tabs.ChatLog {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      actions: {
        // pushRoll: this.#pushRoll,
      }
    }
  );

  static getMessageAndRoll(event) {
    const { messageId } = event.target.closest("[data-message-id]")?.dataset ?? {};
    let message = game.messages.get(messageId);

    // Copy the roll.
    let roll = message.rolls[0];
    return { message, roll };
  }

  // static async #pushRoll(event) {
  //   let { message, roll } = OutsideTheWireChatLog.getMessageAndRoll(event);

  //   // Delete the previous message.
  //   await message.delete();

  //   // Push the roll and send it.
  //   await roll.push();
  //   roll.options.stressCost += roll.attributeTrauma;
  //   await Promise.all([
  //     applyStress(message, roll),
  //   ]);

  //   const newMessage = await roll.toMessage({
  //     speaker: message.speaker,
  //     flavor: message.flavor,
  //     // TODO: get the roll mode from the original message
  //     rollMode: game.settings.get('core', 'rollMode'),
  //   });
  //   await game.dice3d?.waitFor3DAnimationByMessageID(newMessage.id);
  //   return message;
  // }
}