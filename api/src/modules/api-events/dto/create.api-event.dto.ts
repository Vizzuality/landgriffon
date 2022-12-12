import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsJSON, IsOptional, IsUUID } from 'class-validator';
import { API_EVENT_KINDS } from 'modules/api-events/api-event.entity';
import * as ApiEventsUserData from 'modules/api-events/dto/apiEvents.user.data.dto';

export class CreateApiEventDTO {
  /**
   * Versioned kind of the event.
   */
  @ApiProperty()
  @IsEnum(API_EVENT_KINDS)
  kind!: API_EVENT_KINDS;

  /**
   * Topic of an event; this will typically be the UUID of an entity in the
   * system about which events are emitted.
   */
  @ApiProperty()
  @IsUUID(4)
  topic!: string;

  /**
   * Data payload of the event. Its semantics depend on kind.
   */
  @ApiPropertyOptional()
  @IsJSON()
  @IsOptional()
  data?:
    | Record<string, unknown>
    | ApiEventsUserData.ActivationTokenGeneratedV1Alpha1;
}
