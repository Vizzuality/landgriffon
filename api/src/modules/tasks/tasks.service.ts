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
import { UpdateJobEventDto } from 'modules/tasks/dto/update-task.dto';
import { TasksRepository } from 'modules/tasks/tasks.repository';
import { AppInfoDTO } from 'dto/info.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TasksService extends AppBaseService<
  Task,
  CreateTaskDto,
  UpdateJobEventDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(TasksRepository)
    public readonly taskRepository: TasksRepository,
  ) {
    super(
      taskRepository,
      taskResource.name.singular,
      taskResource.name.singular,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<Task> {
    return {
      attributes: ['timestamp', 'topic', 'status', 'data'],
      keyForAttribute: 'camelCase',
    };
  }

  async getJobsByUser(userId: string): Promise<Task[]> {
    const tasks: Task[] = await this.taskRepository.find({
      where: { createdBy: userId },
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
      createdBy: userId,
      data: data ?? {},
    });
  }

  // TODO: First version. Add better typing to data & errors and enhance storage of both. We need to decide how we want to tackle this
  async updateImportJobEvent(updateTask: {
    taskId: string;
    newStatus: TASK_STATUS;
    newData?: Record<string, any>;
    newErrors?: Error;
  }): Promise<Task> {
    /**
     * @debt
     * TypeORM does not provide a friendly API to handle json fields on a UPDATE statement
     * For now we are retrieving the event, update data withing the API and save it back
     *
     * @todo: Make this work nicely in distributed systems.
     *
     */
    const { taskId, newStatus, newData, newErrors } = updateTask;
    const task: Task | undefined = await this.taskRepository.findOne(taskId);
    if (!task) {
      throw new NotFoundException(`Could not found Task with ID: ${taskId}`);
    }
    const { data } = task;

    if (newData) {
      task.data = { ...data, ...newData };
    }

    if (newErrors) {
      task.errors.push({ [newErrors.name]: newErrors.message });
    }

    task.status = newStatus;
    return task.save();
  }
}
