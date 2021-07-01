import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

import * as multer from 'multer';

import { v4 as uuidv4 } from 'uuid';
import * as config from 'config';

/**
 * Options for Multer
 */

/**
 * @note: We currently just allow the storage path under de /tmp folder.
 * Any folder under /tmp will be created on first upload and all file uploads
 * will be stored there and inmediately deleted  in the current API Run
 */

export const STORAGE_PATH = '/tmp/dataset-uploads';

export const uploadOptions: MulterOptions = {
  storage: multer.diskStorage({
    filename: (
      _req: any,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      cb(null, `${uuidv4()}_${file.originalname}`);
    },
    destination: STORAGE_PATH,
  }),
  limits: {
    fileSize: config.get('fileUploads.sizeLimit') as number | 1024e2,
  },
};
