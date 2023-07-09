import { Injectable, NotFoundException } from '@nestjs/common';
import {
  TASK_STATUS,
  TASK_TYPE,
  Task,
  taskResource,
} from 'modules/tasks/task.entity';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { CreateTaskDto } from 'modules/tasks/dto/create-task.dto';
import { TasksRepository } from 'modules/tasks/tasks.repository';
import { AppInfoDTO } from 'dto/info.dto';
import {
  UpdateImportTask,
  UpdateTaskDto,
} from 'modules/tasks/dto/update-task.dto';

@Injectable()
export class TasksService extends AppBaseService<
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  AppInfoDTO
> {
  constructor(public readonly taskRepository: TasksRepository) {
    super(
      taskRepository,
      taskResource.name.singular,
      taskResource.name.singular,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<Task> {
    return {
      attributes: [
        'createdAt',
        'topic',
        'status',
        'data',
        'errors',
        'logs',
        'user',
        'dismissedBy',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async getJobsByUser(userId: string): Promise<Task[]> {
    const tasks: Task[] = await this.taskRepository.find({
      where: { userId },
    });
    if (!tasks) throw new NotFoundException('No Jobs found for current user');
    return tasks;
  }

  async createTask(createTask: {
    data?: Record<string, any>;
    userId: string;
  }): Promise<Task> {
    const { userId, data } = createTask;
    return this.create({
      type: TASK_TYPE.SOURCING_DATA_IMPORT,
      status: TASK_STATUS.PROCESSING,
      userId,
      data: data ?? {},
    });
  }

  // TODO: First version. Add better typing to data & errors and enhance storage of both. We need to decide how we want to tackle this
  async updateImportTask(updateTask: UpdateImportTask): Promise<Task> {
    /**
     * @debt
     * TypeORM does not provide a friendly API to handle json fields on a UPDATE statement
     * For now we are retrieving the event, update data withing the API and save it back
     *
     * @todo: Make this work nicely in distributed systems.
     *
     */
    const { taskId, newStatus, newData, newErrors, newLogs, message } =
      updateTask;
    const task: Task | null = await this.taskRepository.findOne({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException(`Could not found Task with ID: ${taskId}`);
    }
    const { data } = task;

    task.message = message;

    if (newData) {
      task.data = { ...data, ...newData };
    }

    if (newErrors) {
      task.errors.push(...newErrors);
    }

    if (newLogs) {
      task.logs.push(
        ...newLogs.map((warning: string): Record<string, string> => {
          return { warning };
        }),
      );
    }

    if (newStatus) task.status = newStatus;
    return task.save();
  }

  async cleanStalledTasks(): Promise<void> {
    const stalledTask: Task | null = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.status = :status', { status: TASK_STATUS.PROCESSING })
      .orderBy('task.createdAt', 'DESC') // assuming you have a createdAt field
      .getOne();
    if (stalledTask) {
      stalledTask.status = TASK_STATUS.FAILED;
      stalledTask.message =
        'Task failed due to a system error. Please contact support.';
      await stalledTask.save();
    }
  }
}
