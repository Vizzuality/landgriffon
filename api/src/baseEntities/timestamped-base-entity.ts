import { BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export class TimestampedBaseEntity extends BaseEntity {
  @CreateDateColumn({
    type: 'timestamptz',
  })
  @ApiProperty()
  createdAt!: string;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  @ApiProperty()
  updatedAt!: string;
}
