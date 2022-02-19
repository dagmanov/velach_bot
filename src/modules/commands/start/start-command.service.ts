import { join } from 'path';

import { Injectable } from '@nestjs/common';

import { Context, Middleware } from 'src/common/types/bot';
import { TemplatesService } from 'src/modules/templates/templates.service';
import {
  getMessageChat,
  getMessageFromContext,
} from 'src/common/utils/context';
import { composeMiddlewares } from 'src/common/utils/middlewares';
import { DbMiddlewareService } from 'src/modules/middlewares/db-middleware.service';
import { PreliminaryDataSaveService } from 'src/modules/middlewares/preliminary-data-save.service';
import { PrivateChatsOnlyMiddlewareService } from 'src/modules/middlewares/private-chats-only.service';
import { FeatureAnalyticsMiddlewareService } from 'src/modules/middlewares/feature-analytics.service';

@Injectable()
export class StartCommandService {
  constructor(
    private templatesService: TemplatesService,
    private dbMiddlewareService: DbMiddlewareService,
    private preliminaryDataSaveService: PreliminaryDataSaveService,
    private privateChatsOnlyMiddlewareService: PrivateChatsOnlyMiddlewareService,
    private featureAnalyticsMiddlewareService: FeatureAnalyticsMiddlewareService,
  ) {}

  private async processMessage(ctx: Context): Promise<void> {
    const text = await this.templatesService.renderTemplate(
      join(__dirname, 'templates', 'greeting.mustache'),
      {},
    );

    const message = getMessageFromContext(ctx);
    const chat = getMessageChat(message);

    ctx.tg.sendMessage(chat.id, text, {
      reply_to_message_id: message.message_id,
      parse_mode: 'MarkdownV2',
    });
  }

  getMessageMiddleware(): Middleware {
    return composeMiddlewares([
      this.dbMiddlewareService.getMiddleware(),
      this.preliminaryDataSaveService.getMiddleware(),
      this.privateChatsOnlyMiddlewareService.getMiddleware(),
      this.featureAnalyticsMiddlewareService.getMiddleware(
        'start-command/message-command',
      ),
      this.processMessage.bind(this),
    ]);
  }
}