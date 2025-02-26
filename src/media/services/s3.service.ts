import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  constructor(private readonly configService: ConfigService) {}

  async signedUrlForPuttingObject(data: any) {
    const key = `${data.folder}/${uuidv4()}-${data.fileName
      .replace(/^.*[\\\/]/, '')
      .replace(/\s/g, '')}`;
    const params = {
      Bucket: this.configService.get<string>('AWS_PUBLIC_BUCKET_NAME'),
      Key: key,
      ACL: data.isPublic ? 'public-read' : 'private',
      ContentType: data.contentType,
    };
    const s3 = new S3();
    const result = await s3.getSignedUrlPromise('putObject', params);
    return { url: result, key };
  }

  public getPublicUrlInS3(fileName) {
    const prefixUrl = `https://${this.configService.get<string>('AWS_PUBLIC_BUCKET_NAME')}.s3.amazonaws.com`;
    const regex = new RegExp(`^${prefixUrl}`, 'g');
    if (!regex.test(fileName)) {
      return `${prefixUrl}/${fileName}`;
    }
    return fileName;
  }

  public transform(fileName) {
    if (!fileName) return undefined;
    return {
      key: fileName,
      originUrl: this.getPublicUrlInS3(fileName),
    };
  }
}
