import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  IEmailService,
  SendMailDTO,
} from 'modules/notifications/email/email.service.interface';
import * as sgMail from '@sendgrid/mail';
import * as config from 'config';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';

const SENDER_MAIL_ADDRESS: string = 'no-reply@landgriffon.com';

@Injectable()
export class SendgridEmailService implements IEmailService {
  logger: Logger = new Logger(SendgridEmailService.name);

  constructor() {
    const sgApiKey: string = config.get('notifications.email.sendGridApiKey');
    if (!sgApiKey) {
      this.logger.warn(
        'Sendgrid API key not found. Email service will not work.',
      );
    }
    sgMail.setApiKey(sgApiKey);
  }

  async sendMail(mail: SendMailDTO): Promise<any> {
    const msg: MailDataRequired = { ...mail, from: SENDER_MAIL_ADDRESS };
    try {
      return sgMail.send(msg);
    } catch (e) {
      this.logger.error(e);
      throw new ServiceUnavailableException(
        'Could not sent confirmation email',
      );
    }
  }
}
