import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { S3Service } from '../services/s3.service';
import { signedUrlDto } from '../dtos/signed-url.dto';

@Controller()
export class S3Microservice {
  constructor(private readonly s3Service: S3Service) {}

  @MessagePattern('getSignedUrlForPuttingObject')
  async getSignedUrlForPuttingObject(@Payload() payload: signedUrlDto) {
    const { url, key } =
      await this.s3Service.signedUrlForPuttingObject(payload);
    return { url, key };
  }
}
