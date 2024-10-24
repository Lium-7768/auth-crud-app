import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  COMMENT = 'COMMENT',
  SYSTEM = 'SYSTEM',
}

export class CreateNotificationDto {
  @ApiProperty({
    enum: NotificationType,
    description: 'Type of the notification',
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({ description: 'Content of the notification' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'ID of the user to receive the notification' })
  @IsNotEmpty()
  userId: number;
}

export class UpdateNotificationDto {
  @ApiProperty({ description: 'Whether the notification has been read' })
  @IsBoolean()
  @IsNotEmpty()
  read: boolean;
}

export class CreateSystemAnnouncementDto {
  @ApiProperty({ description: 'Content of the system announcement' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class NotificationResponseDto {
  @ApiProperty({ description: 'Unique identifier of the notification' })
  id: number;

  @ApiProperty({
    enum: NotificationType,
    description: 'Type of the notification',
  })
  type: NotificationType;

  @ApiProperty({ description: 'Content of the notification' })
  content: string;

  @ApiProperty({ description: 'Whether the notification has been read' })
  read: boolean;

  @ApiProperty({
    description: 'Timestamp of when the notification was created',
  })
  createdAt: Date;

  @ApiProperty({ description: 'ID of the user who received the notification' })
  userId: number;
}
