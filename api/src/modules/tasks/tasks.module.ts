import { Module } from '@nestjs/common';
import { TasksController } from 'modules/tasks/tasks.controller';
import { TasksService } from 'modules/tasks/tasks.service';
import { Task } from 'modules/tasks/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksRepository } from 'modules/tasks/tasks.repository';
import { TaskReportService } from 'modules/tasks/task-report.service';
import { ReportsModule } from 'modules/reports/reports.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), ReportsModule],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository, TaskReportService],
  exports: [TasksService],
})
export class TasksModule {}
