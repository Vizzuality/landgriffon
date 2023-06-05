import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TASK_TYPE } from 'modules/tasks/task.entity';

export class GetReportsDto {
  @ApiProperty()
  @IsEnum(TASK_TYPE)
  type!: TASK_TYPE;
}
