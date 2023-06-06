import { Injectable } from '@nestjs/common';

// import { AsyncParser } from '@json2csv/node';
// Above blows because of node module resolution. if updated to node16 or nodenext, other
// dependencies cant be transpiled. We could update some, but i.e class-validator is at its last version
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AsyncParser } = require('@json2csv/node');

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

    const asyncParser: typeof AsyncParser = new AsyncParser(json2csvOptions);

    return asyncParser.parse(errors).promise();
  }
}
