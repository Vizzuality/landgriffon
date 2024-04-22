import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { IWebSocketService } from 'modules/notifications/websockets/websockets.service.interface';
import {
  EVENT_KINDS,
  SocketPayload,
} from 'modules/notifications/websockets/types';

//TODO: Implement authentication on client connection

@WebSocketGateway({ cors: true })
export class NestWebsocketsService
  implements IWebSocketService, OnGatewayConnection
{
  logger: Logger = new Logger(NestWebsocketsService.name);

  @WebSocketServer()
  server: Server;

  onModuleInit(): void {
    this.server.on('connection', (socket) => {
      this.logger.log(`Client connected: ${socket.id}`);
    });
  }

  handleConnection(client: any, ...args: any[]): any {
    this.logger.log(`Client connected: ${client.id}`);
    this.logger.warn('token in header', client.handshake.headers);
  }

  emit(event: EVENT_KINDS, payload: any): void {
    const socketPayload: SocketPayload = { kind: event, data: payload };
    this.server.emit(event, socketPayload);
    this.logger.debug(`Payload: ${payload} emitted to Socket`);
  }
}
