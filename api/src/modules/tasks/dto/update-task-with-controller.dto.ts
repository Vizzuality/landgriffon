import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { TASK_STATUS } from 'modules/tasks/task.entity';

export class UpdateTaskWithControllerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  taskId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  newStatus?: TASK_STATUS;

  @ApiPropertyOptional()
  @IsOptional()
  newData?: Record<string, any>;
}
