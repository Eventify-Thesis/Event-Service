import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateInterestDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    id: string;
    
    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    eventId: string;
}
