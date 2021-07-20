import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export function ApiOkTreeResponse(options: {
  treeNodeType: Type;
}): MethodDecorator {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(options.treeNodeType) },
          {
            properties: {
              children: {
                type: 'array',
                items: { $ref: getSchemaPath(options.treeNodeType) },
              },
            },
          },
        ],
      },
    }),
  );
}
