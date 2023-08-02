import {
  IEmailService,
  SendMailDTO,
} from '../../src/modules/notifications/email/email.service.interface';
import { Logger } from '@nestjs/common';

export class MockEmailService implements IEmailService {
  logger: Logger = new Logger(MockEmailService.name);

  async sendMail(mail: SendMailDTO): Promise<void> {
    this.logger.warn(`Email Service mock called... `);
    return Promise.resolve();
  }
}
