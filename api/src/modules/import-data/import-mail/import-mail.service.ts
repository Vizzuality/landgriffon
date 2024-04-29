import { Inject, Injectable, Logger } from '@nestjs/common';
import { IEmailService } from 'modules/notifications/email/email.service.interface';

type ImportEmailDTO = {
  email: string;
  fileName: string;
  importDate: string;
  errorContent?: string;
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
    const base64Csv = Buffer.from(dto.errorContent || '').toString('base64');

    const htmlContent: string = `
      <p>Dear ${dto.email || 'User'},</p>
      <p>Your import of file ${dto.fileName} has failed.</p>
      <p>Import date: ${dto.importDate}</p>
      <p>Please find the error report attached.</p>
    `;
    await this.emailService.sendMail({
      to: dto.email,
      subject: 'Import failure',
      html: htmlContent,
      attachments: [
        {
          content: base64Csv,
          filename: `${dto.fileName}_error_report.csv`,
          type: 'text/csv',
          disposition: 'attachment',
        },
      ],
    });
    this.logger.debug(`Sent import failure email to ${dto.email}`);
  }
}
