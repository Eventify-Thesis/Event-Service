import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateAttendeeDto {
    @ApiProperty({ description: 'First name of the attendee' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ description: 'Last name of the attendee' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ description: 'Email address of the attendee' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'ID of the ticket type' })
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    @IsNotEmpty()
    ticketTypeId: number;

    @ApiProperty({ description: 'ID of the order' })
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    @IsOptional()
    orderId: number;
}
