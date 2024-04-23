import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  WsException,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IWebSocketService } from 'modules/notifications/websockets/websockets.service.interface';
import {
  EVENT_KINDS,
  SocketPayload,
} from 'modules/notifications/websockets/types';
import { WsAuthGuard } from 'modules/notifications/websockets/ws-auth.guard';
import { User } from 'modules/users/user.entity';

//
@WebSocketGateway({ cors: true })
export class NestWebsocketsService implements IWebSocketService, OnGatewayInit {
  logger: Logger = new Logger(NestWebsocketsService.name);

  constructor(private readonly wsAuthGuard: WsAuthGuard) {}

  @WebSocketServer()
  server: Server;

  onModuleInit(): void {
    this.logger.log('Websockets service initialized');
  }

  /**
   *  @note: Check WsAuthGuard notes. Since NestJS has limitations with websockets, we are following this approach:
   *  https://www.youtube.com/watch?v=4h9-c6D5Pos&ab_channel=jemini-io
   *
   *  Exception messages are not propagated to the client and creating a exception filter does not seems to work.
   */

  afterInit(client: Socket): void {
    client.use(async (req, next) => {
      try {
        const user: User = await this.wsAuthGuard.verifyUser(
          req as unknown as Socket,
        );
        this.logger.log(`User ${user.email} connected to Socket`);
        next();
      } catch (e: any) {
        this.logger.error(e);
        next(new WsException('Unauthorized'));
      }
    });
  }

  emit(event: EVENT_KINDS, payload: any): void {
    const socketPayload: SocketPayload = { kind: event, data: payload };
    this.server.emit(event, socketPayload);
    this.logger.debug(`Payload: ${payload} emitted to Socket`);
  }
}
