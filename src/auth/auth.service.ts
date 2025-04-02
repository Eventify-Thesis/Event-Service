import { BadRequestException, Injectable } from '@nestjs/common';

import { ForbiddenException } from '@nestjs/common';
import { EventService } from 'src/event/services/event.service';

@Injectable()
export class AuthService {}
