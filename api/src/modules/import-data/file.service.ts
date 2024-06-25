import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { access, unlink } from 'fs/promises';
import * as XLSX from 'xlsx';
import { WorkBook } from 'xlsx';
import { difference } from 'lodash';

@Injectable()
export class FileService<T extends Record<string, any[]>> {
  private readonly logger: Logger = new Logger(FileService.name);

  async transformToJson(
    filePath: string,
    sheetsMap: Record<string, keyof T>,
  ): Promise<T> {
    try {
      const workBook: WorkBook = XLSX.readFile(filePath);
      return this.parseSheets(workBook, sheetsMap);
    } catch ({ message }) {
      this.logger.error(message);
      throw new Error(`XLSX file could not been parsed: ${message}`);
    }
  }

  private parseSheets(
    workBook: WorkBook,
    sheetsMap: Record<string, keyof T>,
  ): T {
    if (difference(Object.keys(sheetsMap), workBook.SheetNames).length) {
      throw new Error(
        `Spreadsheet is missing requires sheets: ${difference(
          Object.keys(sheetsMap),
          workBook.SheetNames,
        ).join(', ')}`,
      );
    }

    const parsedSheets: Record<string, any[]> = {};

    for (const [key, value] of Object.entries(sheetsMap)) {
      parsedSheets[value as string] = XLSX.utils.sheet_to_json(
        workBook.Sheets[key],
      );
    }

    return parsedSheets as T;
  }

  async isFilePresentInFs(filePath: string): Promise<void> {
    try {
      await access(filePath);
    } catch (err) {
      throw new NotFoundException(`File ${filePath} could not been found`);
    }
  }

  async deleteDataFromFS(filePath: string): Promise<void> {
    this.logger.log(`Deleting ${filePath} from file system...`);
    await this.isFilePresentInFs(filePath);
    return unlink(filePath);
  }
}
