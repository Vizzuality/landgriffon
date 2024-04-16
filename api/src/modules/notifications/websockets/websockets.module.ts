import { Module } from '@nestjs/common';
import { NestWebsocketsService } from 'modules/notifications/websockets/websockets.service';

export const IWebSocketServiceToken: string = 'IWebSocketService';

@Module({
  providers: [
    { provide: IWebSocketServiceToken, useClass: NestWebsocketsService },
  ],
  exports: [IWebSocketServiceToken],
})
export class WebSocketsModule {}
