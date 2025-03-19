import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Setting } from '../entities/setting.entity';

@Injectable()
export class SettingRepository extends Repository<Setting> {
  constructor(private dataSource: DataSource) {
    super(Setting, dataSource.createEntityManager());
  }
}
