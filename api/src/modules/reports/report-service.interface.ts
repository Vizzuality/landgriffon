export interface IReportService {
  generateReport(data: any, options: object): Promise<string>;
}
