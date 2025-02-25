import { Module } from '@nestjs/common';
import { ClerkStrategy } from './strategies/clerk.strategy';
import { PassportModule } from '@nestjs/passport';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from 'src/event/event.module';
import { AuthService } from './auth.service';
import { ModuleRef } from '@nestjs/core';

@Module({
  imports: [PassportModule, ConfigModule, EventModule],
  providers: [ClerkStrategy, ClerkClientProvider, AuthService],
  exports: [PassportModule, AuthService, ModuleRef],
})
export class AuthModule {}
