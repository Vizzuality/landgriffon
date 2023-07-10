import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { UpdateTaskDto } from 'modules/tasks/dto/update-task.dto';
import { CreateTaskDto } from 'modules/tasks/dto/create-task.dto';
import { SetUserInterceptor } from 'decorators/set-user.interceptor';
import {
  JSONAPIQueryParams,
  JSONAPISingleEntityQueryParams,
} from 'decorators/json-api-parameters.decorator';

@Controller('/api/v1/tasks')
@ApiTags(taskResource.className)
@ApiBearerAuth()
export class TasksController {
  constructor(protected readonly taskService: TasksService) {}

  @ApiOperation({ description: 'Find all tasks' })
  @ApiOkResponse({ type: Task })
  @JSONAPIQueryParams({
    availableFilters: taskResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
    entitiesAllowedAsIncludes: taskResource.entitiesAllowedAsIncludes,
  })
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
  @JSONAPISingleEntityQueryParams({
    entitiesAllowedAsIncludes: taskResource.entitiesAllowedAsIncludes,
    availableFilters: taskResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get(':id')
  async findOne(
    @ProcessFetchSpecification({
      allowedFilters: taskResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
    @Param('id') id: string,
  ): Promise<Task> {
    return this.taskService.serialize(
      await this.taskService.getById(id, fetchSpecification),
    );
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
  @Patch(':id')
  @UsePipes(ValidationPipe)
  async update(
    @Param('id') id: string,
    @Body()
    dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.taskService.serialize(await this.taskService.update(id, dto));
  }

  @ApiOperation({ description: 'Deletes a task' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.taskService.remove(id);
  }
}
