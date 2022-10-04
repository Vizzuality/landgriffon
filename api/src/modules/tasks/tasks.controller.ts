import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { SetUserInterceptor } from 'decorators/set-user.interceptor';

@Controller('/api/v1/tasks')
@ApiTags(taskResource.className)
@ApiBearerAuth()
export class TasksController {
  constructor(protected readonly taskService: TasksService) {}

  @ApiOperation({ description: 'Find all tasks' })
  @ApiOkResponse({ type: Task })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: taskResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<Task> {
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
    return this.taskService.serialize(await this.taskService.getById(id));
  }

  @ApiOperation({ description: 'Create a Task' })
  @ApiOkResponse({ type: Task })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @UseInterceptors(SetUserInterceptor)
  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.taskService.serialize(await this.taskService.create(dto));
  }

  @ApiOperation({ description: 'Updates a task' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiOkResponse({ type: Task })
  @Put()
  @UsePipes(ValidationPipe)
  async update(
    @Body()
    dto: UpdateTaskWithControllerDto,
  ): Promise<Task> {
    return this.taskService.serialize(
      await this.taskService.updateImportJobEvent(dto),
    );
  }

  @ApiOperation({ description: 'Deletes a task' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.taskService.remove(id);
  }
}
