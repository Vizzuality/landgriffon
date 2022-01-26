import { Injectable } from '@nestjs/common';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { AppInfoDTO } from 'dto/info.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Target, targetResource } from 'modules/targets/target.entity';
import { TargetsRepository } from 'modules/targets/targets.repository';
import { CreateTargetDto } from 'modules/targets/dto/create-target.dto';
import { UpdateTargetDto } from 'modules/targets/dto/update-target.dto';

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

  get serializerConfig(): JSONAPISerializerConfig<Target> {
    return {
      attributes: ['baseLineYear', 'targetYear', 'value', 'indicatorId'],
      keyForAttribute: 'camelCase',
    };
  }
}
