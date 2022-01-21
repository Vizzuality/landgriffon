import { ApiProperty } from '@nestjs/swagger';

export class CreateTargetDto {
  @ApiProperty()
  baseLineYear!: number;

  @ApiProperty()
  year!: number;

  @ApiProperty()
  value!: number;

  @ApiProperty()
  indicatorId: string;

  @ApiProperty()
  lastEditedUserId?: string;
}
