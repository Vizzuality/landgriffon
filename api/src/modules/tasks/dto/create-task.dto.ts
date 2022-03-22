import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { TASK_STATUS, TASK_TYPE } from 'modules/tasks/task.entity';

export class CreateTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type!: TASK_TYPE;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  status!: TASK_STATUS;

  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsOptional()
  data!: Record<string, any>;
}
