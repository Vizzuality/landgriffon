import { typeOrmConfig } from 'typeorm.config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const migrationConfig: TypeOrmModuleOptions = { ...typeOrmConfig };

export = migrationConfig;
