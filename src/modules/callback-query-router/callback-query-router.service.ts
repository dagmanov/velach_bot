import { Injectable, Logger } from '@nestjs/common';
import { Router } from 'telegraf';
import { CallbackQuery } from 'typegram';

import {
  RouteFn,
  Context,
  Middleware,
  IBaseCallbackQueryData,
} from 'src/common/types/bot';
import {
  getContextCallbackQuery,
  getCallbackQueryData,
} from 'src/common/utils/context';
import { CALLBACK_QUERY_COMMANDS } from 'src/common/constants';
import { parseCallbackData } from 'src/common/utils/keyboard';
import { BikecheckCommandService } from 'src/modules/commands/bikecheck/bikecheck-command.service';
import { DeletedCommandService } from 'src/modules/commands/deleted/deleted-command.service';
import { OnSaleCommandService } from 'src/modules/commands/on-sale/on-sale-command.service';
import { TopCommandService } from 'src/modules/commands/top/top-command.service';

const logger = new Logger('Callback Queries Service');

@Injectable()
export class CallbackQueryRouterService {
  private router: Router<Context>;
  private bikecheckCommandService: BikecheckCommandService;
  private deletedCommandService: DeletedCommandService;
  private onSaleCommandService: OnSaleCommandService;
  private topCommandService: TopCommandService;

  constructor(
    bikecheckCommandService: BikecheckCommandService,
    deletedCommandService: DeletedCommandService,
    onSaleCommandService: OnSaleCommandService,
    topCommandService: TopCommandService,
  ) {
    this.bikecheckCommandService = bikecheckCommandService;
    this.deletedCommandService = deletedCommandService;
    this.onSaleCommandService = onSaleCommandService;
    this.topCommandService = topCommandService;

    const routeFn: RouteFn = (ctx) => {
      let callbackQuery: CallbackQuery;

      try {
        callbackQuery = getContextCallbackQuery(ctx);
      } catch (err) {
        logger.error('No callback query found in context');
        return null;
      }

      let data: IBaseCallbackQueryData;

      try {
        data = parseCallbackData<IBaseCallbackQueryData>(
          getCallbackQueryData(callbackQuery),
        );
      } catch (err) {
        logger.error('Could not parse callback query data');
        return null;
      }

      if (Object.values(CALLBACK_QUERY_COMMANDS).includes(data.c.toString())) {
        return { route: data.c.toString() };
      }

      return null;
    };

    this.router = new Router(routeFn);

    this.router
      .on(
        CALLBACK_QUERY_COMMANDS.SHOW_NEXT_BIKECHECK,
        this.bikecheckCommandService.getCallbackQueryMiddleware(
          CALLBACK_QUERY_COMMANDS.SHOW_NEXT_BIKECHECK,
        ),
      )
      .on(
        CALLBACK_QUERY_COMMANDS.SHOW_PREVIOUS_BIKECHECK,
        this.bikecheckCommandService.getCallbackQueryMiddleware(
          CALLBACK_QUERY_COMMANDS.SHOW_PREVIOUS_BIKECHECK,
        ),
      )
      .on(
        CALLBACK_QUERY_COMMANDS.DELETE_BIKECHECK,
        this.bikecheckCommandService.getCallbackQueryMiddleware(
          CALLBACK_QUERY_COMMANDS.DELETE_BIKECHECK,
        ),
      )
      .on(
        CALLBACK_QUERY_COMMANDS.TOGGLE_ON_SALE,
        this.bikecheckCommandService.getCallbackQueryMiddleware(
          CALLBACK_QUERY_COMMANDS.TOGGLE_ON_SALE,
        ),
      )
      .on(
        CALLBACK_QUERY_COMMANDS.LIKE,
        this.bikecheckCommandService.getCallbackQueryMiddleware(
          CALLBACK_QUERY_COMMANDS.LIKE,
        ),
      )
      .on(
        CALLBACK_QUERY_COMMANDS.DISLIKE,
        this.bikecheckCommandService.getCallbackQueryMiddleware(
          CALLBACK_QUERY_COMMANDS.DISLIKE,
        ),
      )
      .on(
        CALLBACK_QUERY_COMMANDS.SHOW_NEXT_DELETED_BIKECHECK,
        this.deletedCommandService.getCallbackQueryMiddleware(
          CALLBACK_QUERY_COMMANDS.SHOW_NEXT_DELETED_BIKECHECK,
        ),
      )
      .on(
        CALLBACK_QUERY_COMMANDS.SHOW_PREVIOUS_DELETED_BIKECHECK,
        this.deletedCommandService.getCallbackQueryMiddleware(
          CALLBACK_QUERY_COMMANDS.SHOW_PREVIOUS_DELETED_BIKECHECK,
        ),
      )
      .on(
        CALLBACK_QUERY_COMMANDS.RESTORE_BIKECHECK,
        this.deletedCommandService.getCallbackQueryMiddleware(
          CALLBACK_QUERY_COMMANDS.RESTORE_BIKECHECK,
        ),
      )
      .on(
        CALLBACK_QUERY_COMMANDS.SHOW_NEXT_ON_SALE_BIKECHECK,
        this.onSaleCommandService.getCallbackQueryMiddleware(
          CALLBACK_QUERY_COMMANDS.SHOW_NEXT_ON_SALE_BIKECHECK,
        ),
      )
      .on(
        CALLBACK_QUERY_COMMANDS.SHOW_PREVIOUS_ON_SALE_BIKECHECK,
        this.onSaleCommandService.getCallbackQueryMiddleware(
          CALLBACK_QUERY_COMMANDS.SHOW_PREVIOUS_ON_SALE_BIKECHECK,
        ),
      )
      .on(
        CALLBACK_QUERY_COMMANDS.SHOW_TOP_BIKECHECK,
        this.topCommandService.getCallbackQueryMiddleware(),
      )
      .otherwise((_, next) => {
        next();
      });
  }

  getMiddleware(): Middleware {
    return this.router.middleware();
  }
}