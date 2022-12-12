import { Inject, Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import * as multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export default class MulterConfigService implements MulterOptionsFactory {
  constructor(
    @Inject('FILE_UPLOAD_SIZE_LIMIT')
    protected readonly fileUploadSizeLimit: number,
    @Inject('FILE_UPLOAD_ALLOWED_FILE_EXTENSION')
    protected readonly allowedFileExtension: string = '.xlsx',
    @Inject('FILE_UPLOAD_STORAGE_PATH') protected readonly storagePath: string,
  ) {}

  createMulterOptions(): MulterModuleOptions {
    const allowedFileExtension: string = this.allowedFileExtension;
    return {
      storage: multer.diskStorage({
        filename: (
          _req: any,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          cb(null, `${uuidv4()}_${file.originalname}`);
        },
        destination: this.storagePath,
      }),
      limits: {
        fileSize: this.fileUploadSizeLimit,
      },
      fileFilter: function (
        _req: any,
        file: Express.Multer.File,
        cb: any,
      ): any {
        cb(null, path.extname(file.originalname) === allowedFileExtension);
      },
    };
  }
}
