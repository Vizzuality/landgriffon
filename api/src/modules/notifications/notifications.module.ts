import { Module } from '@nestjs/common';
import { SendgridEmailService } from 'modules/notifications/email/sendgrid.email.service';

@Module({
  providers: [{ provide: 'IEmailService', useClass: SendgridEmailService }],
  exports: ['IEmailService'],
})
export class NotificationsModule {}
