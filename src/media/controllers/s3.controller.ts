import { Controller, Query, Get } from '@nestjs/common';
import { S3Service } from 'src/media/services/s3.service';
import { signedUrlDto } from 'src/media/dtos/signed-url.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('media/signedUrlForPuttingObject')
export class S3Controller {
  constructor(private s3Service: S3Service) {}

  @ApiQuery({
    name: 'fileName',
    required: true,
    type: 'string',
    example: 'test.jpg',
  })
  @ApiQuery({
    name: 'contentType',
    required: true,
    type: 'string',
    example: 'image/jpeg',
  })
  @ApiQuery({
    name: 'isPublic',
    required: true,
    type: 'boolean',
    example: 'isPublic',
  })
  @Get()
  async getSignedUrlForPuttingObject(@Query() dto: signedUrlDto) {
    const { url, key } = await this.s3Service.signedUrlForPuttingObject(dto);
    return { url, key };
  }
}
