import { Logger } from '@nestjs/common';

export class SendMailDTO {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailService {
  logger: Logger;

  sendMail(sendMailDTO: SendMailDTO): Promise<any>;
}
