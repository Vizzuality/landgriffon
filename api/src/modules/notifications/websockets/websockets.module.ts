import { forwardRef, Module } from '@nestjs/common';
import { NestWebsocketsService } from 'modules/notifications/websockets/websockets.service';
import { AuthenticationModule } from 'modules/authentication/authentication.module';
import { WsAuthGuard } from './ws-auth.guard';

export const IWebSocketServiceToken: string = 'IWebSocketService';

@Module({
  imports: [forwardRef(() => AuthenticationModule)],
  providers: [
    { provide: IWebSocketServiceToken, useClass: NestWebsocketsService },
    WsAuthGuard,
  ],
  exports: [IWebSocketServiceToken],
})
export class WebSocketsModule {}
