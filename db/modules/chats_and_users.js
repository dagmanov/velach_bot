const BaseDbModule = require('./base_module');

class ChatsAndUsersModule extends BaseDbModule {

  async createOrUpdateChat(chat) {
    var QUERY = '\
      INSERT INTO tg_chat\
        (id)\
      VALUES\
        ($1)\
      ON CONFLICT (id) DO NOTHING\
      RETURNING *';

    var queryResult = await this._client.query(QUERY, [chat.id]);
    return queryResult.rows[0];
  };

  async createOrUpdateUser(user) {
    var QUERY = '\
      INSERT INTO tg_user\
        (id, username, first_name, last_name)\
      VALUES\
        ($1, $2, $3, $4)\
      ON CONFLICT (id) DO UPDATE SET\
        username = $2,\
        first_name = $3,\
        last_name = $4\
      RETURNING *';

    var queryResult = await this._client.query(QUERY, [user.id, user.username, user.first_name, user.last_name]);
    return queryResult.rows[0];
  };

  async addUserToChat(user, chat) {
    var QUERY = '\
      INSERT INTO tg_chat_user_mtm\
        (tg_chat_id, tg_user_id)\
      VALUES\
        ($1, $2)\
      ON CONFLICT (tg_chat_id, tg_user_id) DO NOTHING\
      RETURNING *';

    var queryResult = await this._client.query(QUERY, [chat.id, user.id]);
    return queryResult.rows[0];
  };

  async makeSureChatAndUserExist(chat, user) {
    await this.createOrUpdateChat(chat);

    if (user) {
      await this.createOrUpdateUser(user);
      await this.addUserToChat(user, chat);
    };
  };

  async getChatGreetingMessage(chat) {
    var QUERY = 'SELECT greeting_message FROM tg_chat WHERE id = $1';

    var queryResult = await this._client.query(QUERY, [chat.id]);

    if (queryResult.rowCount == 0) {
      throw new Error(`chat ${chat.id} does not exist!`);
    };

    return queryResult.rows[0].greeting_message;
  };

};

module.exports = ChatsAndUsersModule;