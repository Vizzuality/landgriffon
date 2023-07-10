import { Injectable } from '@nestjs/common';
import { AsyncParser } from '@json2csv/node';

export interface ErrorRecord {
  line: number;
  error: string;
}

@Injectable()
export class ReportService {
  async generateImportErrorReportStream(
    errors: ErrorRecord[],
  ): Promise<string> {
    const json2csvOptions: { fields: ['line', 'error'] } = {
      fields: ['line', 'error'],
    };

    const asyncParser: AsyncParser<any, any> = new AsyncParser(json2csvOptions);

    return asyncParser.parse(errors).promise();
  }
}
