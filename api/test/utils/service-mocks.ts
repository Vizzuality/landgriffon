import {
  IEmailService,
  SendMailDTO,
} from '../../src/modules/notifications/email/email.service.interface';
import { Logger } from '@nestjs/common';
import {
  AlertedGeoregionsBySupplier,
  EUDRAlertDatabaseResult,
  EUDRAlertDates,
  GetAlertSummary,
  IEUDRAlertsRepository,
} from 'modules/eudr-alerts/eudr.repositoty.interface';
import { FileService } from '../../src/modules/import-data/file.service';

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

  getAlertSummary(dto: GetAlertSummary): Promise<EUDRAlertDatabaseResult[]> {
    return Promise.resolve([]);
  }

  getAlertedGeoRegionsBySupplier(dto: {
    supplierIds: string[];
    startAlertDate: Date;
    endAlertDate: Date;
  }): Promise<AlertedGeoregionsBySupplier[]> {
    return Promise.resolve([]);
  }
}

export class MockFileService extends FileService<any> {
  async deleteDataFromFS(): Promise<void> {
    return;
  }
}
