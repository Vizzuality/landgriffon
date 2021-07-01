import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { unlink, access } from 'fs/promises';

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
    if (filePath.startsWith('/tmp')) {
      await this.isFilePresentInFs(filePath);
      await unlink(filePath);
    } else {
      throw new Error(
        `Could not complete deletion: ${filePath} is not in /tmp`,
      );
    }
  }
}
