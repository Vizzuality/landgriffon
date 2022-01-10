import { TASK_STATUS } from 'modules/tasks/task.entity';

export class UpdateJobEventDto {
  status!: TASK_STATUS;

  data!: Record<string, any>;
}
