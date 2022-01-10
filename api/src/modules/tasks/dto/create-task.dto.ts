import { TASK_STATUS, TASK_TYPE } from 'modules/tasks/task.entity';

export class CreateTaskDto {
  type!: TASK_TYPE;

  status!: TASK_STATUS;

  createdBy: string;

  data!: Record<string, any>;
}
