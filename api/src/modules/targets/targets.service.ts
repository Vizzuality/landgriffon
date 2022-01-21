import { Injectable } from '@nestjs/common';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { AppInfoDTO } from 'dto/info.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Target, targetResource } from './target.entity';
import { TargetsRepository } from './targets.repository';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';

@Injectable()
export class TargetsService extends AppBaseService<
  Target,
  CreateTargetDto,
  UpdateTargetDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(TargetsRepository)
    public readonly targetsRepository: TargetsRepository,
  ) {
    super(
      targetsRepository,
      targetResource.name.singular,
      targetResource.name.singular,
    );
  }

  // To Do
  get serializerConfig(): JSONAPISerializerConfig<Target> {
    return {
      attributes: [],
      keyForAttribute: 'camelCase',
    };
  }
}
