import { S3Service } from 'src/media/services/s3.service';
import { Global, Module } from '@nestjs/common';
import { S3Controller } from 'src/media/controllers/s3.controller';
import { S3Microservice } from 'src/media/controllers/s3.microservice';

@Global()
@Module({
  providers: [S3Service],
  exports: [S3Service],
  controllers: [S3Controller, S3Microservice],
})
export class MediaModule {}
