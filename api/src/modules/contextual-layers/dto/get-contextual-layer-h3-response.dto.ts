import { ApiProperty } from '@nestjs/swagger';
import { H3IndexValueData } from 'modules/h3-data/h3-data.entity';

export class GetContextualLayerH3ResponseDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        h: {
          type: 'string',
        },
        v: {
          type: 'number',
        },
      },
    },
  })
  data: H3IndexValueData[];
}
