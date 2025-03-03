import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import AbstractRepository from 'src/common/abstracts/repository.abstract';
import { Member, MemberDocument } from '../entities/member.entity';

@Injectable()
export class MemberRepository extends AbstractRepository<MemberDocument> {
  constructor(@InjectModel(Member.name) model: PaginateModel<MemberDocument>) {
    super(model);
  }
}
