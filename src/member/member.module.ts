import { Module } from '@nestjs/common';
import { PlannerMemberController } from './controllers/planner/member.controller';
import { MemberService } from './services/member.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberSchema } from './entities/member.entity';
import { MemberRepository } from './repositories/member.repository';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
  ],
  controllers: [PlannerMemberController],
  providers: [MemberService, MemberRepository, ClerkClientProvider],
  exports: [MemberService, MemberRepository],
})
export class MemberModule {}
