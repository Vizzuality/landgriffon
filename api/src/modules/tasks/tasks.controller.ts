import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { PaginationMeta } from 'utils/app-base.service';
import { Task, taskResource } from 'modules/tasks/task.entity';
import { TasksService } from 'modules/tasks/tasks.service';
import { UpdateTaskWithControllerDto } from 'modules/tasks/dto/update-task-with-controller.dto';
import { CreateTaskDto } from 'modules/tasks/dto/create-task.dto';

@Controller('/api/v1/tasks')
@ApiTags(taskResource.className)
export class TasksController {
  constructor(protected readonly taskService: TasksService) {}

  @ApiOperation({ description: 'Find all tasks' })
  @ApiOkResponse({ type: Task })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get()
  async findAll(
    // To implement once Auth is merged:
    //@GetUser() user: User,
    @ProcessFetchSpecification({
      allowedFilters: taskResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<Task> {
    // To implement once Auth is merged:
    // fetchSpecification.filter
    //   ? (fetchSpecification.filter.createdBy = [user.id])
    //   : (fetchSpecification.filter = {
    //       createdBy: [user.id],
    //     });
    const results: {
      data: (Partial<Task> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.taskService.findAllPaginated(fetchSpecification);
    return this.taskService.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find task by id' })
  @ApiOkResponse({ type: Task })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Task> {
    return await this.taskService.serialize(await this.taskService.getById(id));
  }

  @ApiOperation({ description: 'Create a Task' })
  @ApiOkResponse({ type: Task })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() dto: CreateTaskDto): Promise<Task> {
    return await this.taskService.serialize(await this.taskService.create(dto));
  }

  @ApiOperation({ description: 'Updates a task' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiOkResponse({ type: Task })
  @Put()
  async update(
    @Body(new ValidationPipe())
    dto: UpdateTaskWithControllerDto,
  ): Promise<Task> {
    return await this.taskService.serialize(
      await this.taskService.updateImportJobEvent(dto),
    );
  }

  @ApiOperation({ description: 'Deletes a task' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.taskService.remove(id);
  }
}
