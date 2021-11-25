/**
 * DTO for RiskMap Response
 */
import { H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';

export class H3MapResponse {
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

  @ApiProperty({
    type: 'object',
    properties: {
      unit: {
        type: 'string',
      },
      quantiles: {
        type: 'array',
        items: {
          type: 'number',
        },
      },
    },
  })
  metadata: { unit: string; quantiles: number[] };
}

export class H3DataResponse extends PickType(H3MapResponse, [
  'data',
] as const) {}
