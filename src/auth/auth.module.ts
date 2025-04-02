import { Module } from '@nestjs/common';
import { ClerkStrategy } from './strategies/clerk.strategy';
import { PassportModule } from '@nestjs/passport';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';

@Module({
  imports: [PassportModule, ConfigModule],
  providers: [ClerkStrategy, ClerkClientProvider, AuthService],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
