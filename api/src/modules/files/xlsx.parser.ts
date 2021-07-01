import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { WorkBook } from 'xlsx';

@Injectable()
export class XlsxParser {
  async transformToJson(filePath: string): Promise<WorkBook> {
    try {
      return XLSX.readFile(filePath);
    } catch (err) {
      throw err;
    }
  }
}
