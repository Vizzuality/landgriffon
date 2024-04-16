import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import {
  EVENT_KINDS,
  IWebSocketService,
} from 'modules/notifications/websockets/websockets.service.interface';

@WebSocketGateway()
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
    this.server.emit(event, payload);
  }
}
