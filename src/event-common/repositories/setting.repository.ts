import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import AbstractRepository from 'src/common/abstracts/repository.abstract';
import { Setting, SettingDocument } from 'src/event/entities/setting.entity';

@Injectable()
export class SettingCommonRepository extends AbstractRepository<SettingDocument> {
  constructor(
    @InjectModel(Setting.name) model: PaginateModel<SettingDocument>,
  ) {
    super(model);
  }
}
