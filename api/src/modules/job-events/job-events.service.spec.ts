import { Test, TestingModule } from '@nestjs/testing';
import { JobEventsService } from './job-events.service';

describe('JobEventsService', () => {
  let service: JobEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobEventsService],
    }).compile();

    service = module.get<JobEventsService>(JobEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
