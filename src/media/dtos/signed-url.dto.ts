import { IsNotEmpty } from 'class-validator';

export class signedUrlDto {
  @IsNotEmpty()
  fileName: string;

  @IsNotEmpty()
  isPublic: boolean;

  @IsNotEmpty()
  contentType: string;
}
