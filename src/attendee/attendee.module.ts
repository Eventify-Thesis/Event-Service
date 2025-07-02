import { Module } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { AttendeeController } from './attendee.controller';
import { EmailModule } from 'src/email/email.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendee } from './entities/attendees.entity';
import { AttendeeRepository } from './repositories/attendee.repository';

@Module({
  imports: [
    EmailModule, 
    TypeOrmModule.forFeature([Attendee])
  ],
  controllers: [AttendeeController],
  providers: [
    AttendeeService,
    AttendeeRepository
  ],
  exports: [
    AttendeeService,
    AttendeeRepository
  ]
})
export class AttendeeModule { }
