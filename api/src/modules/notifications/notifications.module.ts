import { Module } from '@nestjs/common';
import { SendgridEmailService } from 'modules/notifications/email/sendgrid.email.service';

export const IEmailServiceToken: string = 'IEmailService';

@Module({
  providers: [{ provide: IEmailServiceToken, useClass: SendgridEmailService }],
  exports: [IEmailServiceToken],
})
export class NotificationsModule {}
