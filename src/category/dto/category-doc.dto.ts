import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({
    example: 'sport',
  })
  code: string;

  @ApiProperty({
    example: 'Sport',
  })
  nameEn: string;

  @ApiProperty({
    example: 'Thể thao',
  })
  nameVi: string;

  @ApiProperty({
    example: 'http://example.com/image.jpg',
  })
  image: string;
}
