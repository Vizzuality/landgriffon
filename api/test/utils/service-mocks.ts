import {
  IEmailService,
  SendMailDTO,
} from '../../src/modules/notifications/email/email.service.interface';
import { Logger } from '@nestjs/common';
import {
  EUDRAlertDates,
  IEUDRAlertsRepository,
} from 'modules/eudr-alerts/eudr.repositoty.interface';

export class MockEmailService implements IEmailService {
  logger: Logger = new Logger(MockEmailService.name);

  async sendMail(mail: SendMailDTO): Promise<void> {
    this.logger.warn(`Email Service mock called... `);
    return Promise.resolve();
  }
}

export class MockAlertRepository implements IEUDRAlertsRepository {
  logger: Logger = new Logger(MockAlertRepository.name);

  getAlerts(): any {
    this.logger.warn(`Alert Repository Mock called... `);
    return new Promise((resolve) => {
      resolve([]);
    });
  }

  getDates(): Promise<EUDRAlertDates[]> {
    return new Promise((resolve) => {
      resolve([]);
    });
  }
}
