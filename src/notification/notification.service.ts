import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Notification, Prisma } from 'src/prisma/generated/client';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  CreateSystemAnnouncementDto,
  NotificationResponseDto,
  NotificationType,
} from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createNotification(
    data: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.create({
      data: {
        type: data.type,
        content: data.content,
        user: { connect: { id: data.userId } },
      },
    });

    return this.mapToResponseDto(notification);
  }

  async getNotifications(userId: number): Promise<NotificationResponseDto[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map(this.mapToResponseDto);
  }

  async markAsRead(
    id: number,
    data: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: { read: data.read },
    });
    return this.mapToResponseDto(notification);
  }

  async createSystemAnnouncement(
    data: CreateSystemAnnouncementDto,
  ): Promise<void> {
    const users = await this.prisma.user.findMany();
    for (const user of users) {
      await this.createNotification({
        type: NotificationType.SYSTEM,
        content: data.content,
        userId: user.id,
      });
    }
  }

  private mapToResponseDto(
    notification: Notification,
  ): NotificationResponseDto {
    return {
      id: notification.id,
      type: notification.type as NotificationType,
      content: notification.content,
      read: notification.read,
      createdAt: notification.createdAt,
      userId: notification.userId,
    };
  }
}
