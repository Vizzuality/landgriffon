import { Inject, Injectable, Logger } from '@nestjs/common';
import { IEmailService } from 'modules/notifications/email/email.service.interface';

type ImportEmailDTO = {
  email: string;
  fileName: string;
  importDate: string;
};

@Injectable()
export class ImportMailService {
  logger: Logger = new Logger(ImportMailService.name);

  constructor(@Inject('IEmailService') private emailService: IEmailService) {}

  async sendImportSuccessMail(dto: ImportEmailDTO): Promise<void> {
    const htmlContent: string = `
      <p>Dear ${dto.email || 'User'},</p>
      <p>Your import of file ${
        dto.fileName
      } has been successfully processed.</p>
      <p>Import date: ${dto.importDate}</p>
    `;
    await this.emailService.sendMail({
      to: dto.email,
      subject: 'Import success',
      html: htmlContent,
    });
    this.logger.debug(`Sent import success email to ${dto.email}`);
  }

  async sendImportFailureMail(dto: ImportEmailDTO): Promise<void> {
    const htmlContent: string = `
      <p>Dear ${dto.email || 'User'},</p>
      <p>Your import of file ${dto.fileName} has failed.</p>
      <p>Import date: ${dto.importDate}</p>
    `;
    await this.emailService.sendMail({
      to: dto.email,
      subject: 'Import failure',
      html: htmlContent,
    });
    this.logger.debug(`Sent import failure email to ${dto.email}`);
  }
}
