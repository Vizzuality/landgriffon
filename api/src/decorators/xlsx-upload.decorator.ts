import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiConsumesXLSX(): any {
  return applyDecorators(
    ApiOperation({
      description: 'Upload XLSX dataset',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'XLSX File',
            format: 'binary',
          },
        },
      },
    }),
    ApiCreatedResponse(),
  );
}
