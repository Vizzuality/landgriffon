import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { IWebSocketService } from 'modules/notifications/websockets/websockets.service.interface';
import {
  EVENT_KINDS,
  SocketPayload,
} from 'modules/notifications/websockets/types';

@WebSocketGateway({ cors: true })
export class NestWebsocketsService implements IWebSocketService {
  logger: Logger = new Logger(NestWebsocketsService.name);

  @WebSocketServer()
  server: Server;

  onModuleInit(): void {
    this.server.on('connection', (socket) => {
      this.logger.log(`Client connected: ${socket.id}`);
    });
  }

  emit(event: EVENT_KINDS, payload: any): void {
    const socketPayload: SocketPayload = { kind: event, data: payload };
    this.server.emit(event, socketPayload);
    this.logger.debug(`Payload: ${payload} emitted to Socket`);
  }
}
