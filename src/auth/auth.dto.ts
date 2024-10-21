import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'The current password of the user' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'The new password for the user' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'user1@example.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    example: '12345678',
    description: 'The password of the user',
  })
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    example: 'user1@example.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    example: '12345678',
    description: 'The password of the user',
  })
  password: string;
}

export class TokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The JWT access token',
  })
  access_token: string;
}
