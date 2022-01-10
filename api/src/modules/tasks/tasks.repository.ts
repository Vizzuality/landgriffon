import { EntityRepository, Repository } from 'typeorm';
import { Task } from 'modules/tasks/task.entity';

@EntityRepository(Task)
export class TasksRepository extends Repository<Task> {}
