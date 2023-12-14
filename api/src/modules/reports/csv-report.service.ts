import { AsyncParser } from '@json2csv/node';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CSVReportService {
  async generateImportErrorReportStream(errors: any): Promise<string> {
    const json2csvOptions: any = {
      fields: ['line', 'error'],
    };
    const asyncParser: AsyncParser<any, any> = new AsyncParser(json2csvOptions);
    return asyncParser.parse(errors).promise();
  }
}
