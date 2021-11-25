/**
 * DTO for H3 years Response
 */
import { ApiProperty } from '@nestjs/swagger';

export class H3YearsResponse {
  @ApiProperty({
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          type: 'number',
          example: 2010,
        },
      },
    },
  })
  data: number[];
}
