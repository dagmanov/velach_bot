const Handler = require('../../../infrastructure/Handler');
const commands = require('../../../text/commands');
const { EVENT_TYPES } = require('../../../infrastructure/events/constants');
const UserExecutesCommand = require('../../../infrastructure/events/UserExecutesCommand');
const Bikecheck = require('../../../entities/Bikecheck');
const User = require('../../../entities/User');
const { getTopCaption } = require('../../../text/captions');

class TopHandler extends Handler {
  async handle(message) {
    this.eventBus.emit(
      EVENT_TYPES.USER_EXECUTES_COMMAND,
      new UserExecutesCommand(commands.setstrava, message.from.id, message.chat.id),
    );

    const tops = await Bikecheck.getTop();

    if (!tops.length) {
      return;
    }

    const bikecheck = tops[0];
    const user = await User.findById(bikecheck.userId);

    const { likes, dislikes } = await bikecheck.getScore();

    await this.bot.sendPhoto(
      message.chat.id,
      bikecheck.telegramImageId,
      {
        reply_to_message_id: message.messageId,
        caption: getTopCaption(likes, dislikes, user.stravaLink, user),
        parse_mode: 'markdown',
      },
    );
  }
}

module.exports = TopHandler;