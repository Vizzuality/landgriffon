import { Injectable } from '@nestjs/common';

@Injectable()
export class SourcingDataExcelValidator {
  constructor() {}

  async validateSheet(sheet: any, sheetName: string): Promise<any> {
    return null as any;
  }
}
