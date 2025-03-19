import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberService } from './services/member.service';
import { PlannerMemberController } from './controllers/planner/member.controller';
import { Member } from './entities/member.entity';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Member])],
  controllers: [PlannerMemberController],
  providers: [MemberService, ClerkClientProvider],
  exports: [MemberService],
})
export class MemberModule {}
