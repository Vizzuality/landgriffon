import { Module } from '@nestjs/common';
import { TasksController } from 'modules/tasks/tasks.controller';
import { TasksService } from 'modules/tasks/tasks.service';
import { TasksRepository } from 'modules/tasks/tasks.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TasksRepository])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
