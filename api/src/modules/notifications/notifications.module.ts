import { Module } from '@nestjs/common';
import { SendgridEmailService } from 'modules/notifications/email/sendgrid.email.service';
import { WebSocketsModule } from 'modules/notifications/websockets/websockets.module';

export const IEmailServiceToken: string = 'IEmailService';

@Module({
  imports: [WebSocketsModule],
  providers: [{ provide: IEmailServiceToken, useClass: SendgridEmailService }],
  exports: [IEmailServiceToken],
})
export class NotificationsModule {}
