import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ICSVReportService } from 'modules/reports/report-service.interface';
import { ParserOptions } from '@json2csv/plainjs';

// import { AsyncParser } from '@json2csv/node';
// Above blows because of node module resolution. if updated to node16 or nodenext, other
// dependencies cant be transpiled. We could update some, but i.e class-validator is at its last version
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AsyncParser } = require('@json2csv/node');

@Injectable()
export class CSVReportService implements ICSVReportService {
  logger: Logger = new Logger(CSVReportService.name);

  private getParser(parserOptions: ParserOptions): typeof AsyncParser {
    return new AsyncParser(parserOptions);
  }

  async generateCSVReport(data: any, options: ParserOptions): Promise<string> {
    try {
      return this.getParser(options).parse(data).promise();
    } catch (e) {
      this.logger.error(`Error generating CSV from data: `, e);
      throw new ServiceUnavailableException(
        `Could not generate CSV Report, contact Administrator`,
      );
    }
  }
}
