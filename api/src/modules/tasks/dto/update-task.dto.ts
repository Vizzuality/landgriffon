import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { TASK_STATUS } from 'modules/tasks/task.entity';

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  status?: TASK_STATUS;

  @ApiPropertyOptional()
  @IsOptional()
  newData?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(4)
  dismissedBy?: string;
}

export type UpdateImportTask = {
  taskId: string;

  newStatus?: TASK_STATUS;

  newData?: Record<string, any>;

  newErrors?: Record<string, any>;

  newLogs?: string[];
};
