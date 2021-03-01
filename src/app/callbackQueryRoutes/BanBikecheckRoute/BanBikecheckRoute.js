const Route = require('../../../infrastructure/Route');
const CallbackQueryDataSaverMiddleware = require('../../middlewares/CallbackQueryDataSaverMiddleware');
const CallbackQueryAdminAuthMiddleware = require('../../middlewares/CallbackQueryAdminAuthMiddleware');
const BanBikecheckHandler = require('./BanBikecheckHandler');
const commands = require('../../../text/callbackQueryCommands');

class DeleteBikecheckRoute extends Route {
  static get middlewareClsList() {
    return [
      CallbackQueryDataSaverMiddleware,
      CallbackQueryAdminAuthMiddleware,
    ];
  }

  static get HandlerCls() {
    return BanBikecheckHandler;
  }

  isMatching(callbackQuery) { // eslint-disable-line
    if (!callbackQuery.data) {
      return false;
    }

    return callbackQuery.data.command === commands.banBikecheck;
  }
}

module.exports = DeleteBikecheckRoute;
