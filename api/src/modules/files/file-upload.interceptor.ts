import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as config from 'config';
import * as path from 'path';

/**
 * Options for Multer
 */

export const fileUploadInterceptor: MulterOptions = {
  storage: multer.diskStorage({
    filename: (
      _req: any,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      cb(null, `${uuidv4()}_${file.originalname}`);
    },
    destination: config.get('fileUploads.storagePath'),
  }),
  limits: {
    fileSize: config.get('fileUploads.sizeLimit') as number,
  },
  fileFilter: function (_req: any, file: Express.Multer.File, cb: any) {
    if (path.extname(file.originalname) !== '.xlsx') {
      return cb(null, false);
    }

    cb(null, true);
  },
};
