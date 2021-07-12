import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { access, unlink } from 'fs/promises';

@Injectable()
export class FileService {
  private readonly logger: Logger = new Logger(FileService.name);

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
