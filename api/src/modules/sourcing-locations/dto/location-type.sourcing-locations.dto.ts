import { ApiProperty } from '@nestjs/swagger';
import { LOCATION_TYPES_PARAMS } from 'modules/sourcing-locations/sourcing-location.entity';

export class LocationTypeWithLabel {
  @ApiProperty()
  label: string;

  @ApiProperty()
  value: LOCATION_TYPES_PARAMS;
}

export class LocationTypesDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
        },
        value: {
          type: 'string',
        },
      },
    },
  })
  data: LocationTypeWithLabel[];
}
