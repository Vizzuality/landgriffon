import { Module } from '@nestjs/common';
import { TasksController } from 'modules/tasks/tasks.controller';
import { TasksService } from 'modules/tasks/tasks.service';
import { Task } from 'modules/tasks/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksRepository } from 'modules/tasks/tasks.repository';
import { ReportService } from 'modules/tasks/report.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository, ReportService],
  exports: [TasksService],
})
export class TasksModule {}
