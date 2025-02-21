import { Injectable, PipeTransform } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { S3Service } from 'src/media/services/s3.service';
@Injectable()
export class ImageTransformPipe implements PipeTransform<any> {
  constructor(private moduleRef: ModuleRef) {}
  transform(value: any) {
    const s3Service = this.moduleRef.get(S3Service, {
      strict: false,
    });
    return {
      ...value,
      image: s3Service.transform(value.image),
    };
  }
}
