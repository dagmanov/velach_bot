const Handler = require('../../../infrastructure/Handler');
const UserExecutesCommand = require('../../../infrastructure/events/UserExecutesCommand');
const Chat = require('../../../entities/Chat');
const { EVENT_TYPES } = require('../../../infrastructure/events/constants');
const commands = require('../../../text/commands');

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

class AnnounceHandler extends Handler {
  async handle(message) {
    this.eventBus.emit(
      EVENT_TYPES.USER_EXECUTES_COMMAND,
      new UserExecutesCommand(commands.bikecheck, message.from.id, message.chat.id),
    );

    if (!message.replyToMessage) {
      await this.bot.sendMessage(message.chat.id, 'Ответь на сообщение с анонсом');
      return;
    }

    if (message.replyToMessage.from.id !== message.from.id) {
      await this.bot.sendMessage(message.chat.id, 'Ответь на свое сообщение с анонсом');
      return;
    }

    const chats = await Chat.findAllPublic();

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < chats.length; i++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.bot.sendMessage(
          chats[i].id,
          message.replyToMessage.text,
          {
            parse_mode: 'markdown',
          },
        );
      } catch (err) {
        console.error(err);
      }

      // eslint-disable-next-line no-await-in-loop
      await wait(10 * 1000);
    }
  }
}

module.exports = AnnounceHandler;