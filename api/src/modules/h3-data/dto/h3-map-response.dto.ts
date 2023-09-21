/**
 * DTO for RiskMap Response
 */
import { H3IndexValueData } from 'modules/h3-data/entities/h3-data.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';

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
      indicatorDataYear: {
        type: 'number',
      },
      materialsH3DataYears: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            materialName: {
              type: 'string',
            },
            materialDataYear: {
              type: 'number',
            },
            materialDataType: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  metadata: {
    unit: string;
    quantiles: number[];
    indicatorDataYear?: number;
    materialsH3DataYears?: MaterialsH3DataYears[];
  };
}

export class MaterialsH3DataYears {
  materialName: string;
  materialDataYear: number | undefined;
  materialDataType: MATERIAL_TO_H3_TYPE;
}

export class H3DataResponse extends PickType(H3MapResponse, [
  'data',
] as const) {}
