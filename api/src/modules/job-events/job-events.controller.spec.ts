import { Test, TestingModule } from '@nestjs/testing';
import { JobEventsController } from './job-events.controller';

describe('JobEventsController', () => {
  let controller: JobEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobEventsController],
    }).compile();

    controller = module.get<JobEventsController>(JobEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
