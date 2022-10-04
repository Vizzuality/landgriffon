import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from 'utils/app-base.service';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';

export class SourcingLocationsMaterialsResponseDto {
  @ApiProperty({
    type: 'object',
    properties: {
      totalItems: {
        type: 'number',
        example: 45,
      },
      totalPages: {
        type: 'number',
        example: 9,
      },
      size: {
        type: 'number',
        example: 5,
      },
      page: {
        type: 'number',
        example: 1,
      },
    },
  })
  'meta': PaginationMeta;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          example: 'sourcing locations',
        },
        id: {
          type: 'string',
          example: 'a2428cbb-e1b1-4313-ad85-9579b260387f',
        },
        attributes: {
          type: 'object',
          properties: {
            locationType: {
              type: 'string',
              example: 'point of production',
            },
            material: {
              type: 'string',
              example: 'bananas',
            },
            materialId: {
              type: 'string',
              example: 'cdde28a2-5692-401b-a1a7-6c68ad38010f',
            },
            t1Supplier: {
              type: 'string',
              example: 'Cargill',
            },
            producer: {
              type: 'string',
              example: 'Moll',
            },
            businessUnit: {
              type: 'string',
              example: 'Accessories',
            },
            locationCountryInput: {
              type: 'string',
              example: 'Japan',
            },
            purchases: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  year: {
                    type: 'number',
                    example: 2010,
                  },
                  tonnage: {
                    type: 'number',
                    example: 730,
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  'data': { type: string; attributes: SourcingLocationMaterial[] }[];
}

export interface SourcingLocationMaterial {
  material: string;
  materialId: string;
  t1Supplier: string | null;
  producer: string | null;
  businessUnit: string;
  country: string | undefined;
  locationType: LOCATION_TYPES;
  purchases: { year: number; tonnage: number }[];
}
