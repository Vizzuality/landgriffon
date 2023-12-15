import { ParserOptions } from '@json2csv/plainjs';

export interface ICSVReportService {
  generateCSVReport(data: any, options: ParserOptions): Promise<string>;
}
