import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from 'src/prisma/generated/client';
import {
  CreateSystemAnnouncementDto,
  UpdateNotificationDto,
  NotificationResponseDto,
} from './dto/notification.dto';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({
    status: 200,
    description: 'Return user notifications.',
    type: [NotificationResponseDto],
  })
  async getNotifications(@Request() req): Promise<NotificationResponseDto[]> {
    return this.notificationService.getNotifications(req.user.userId);
  }

  @Post(':id/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read.',
    type: NotificationResponseDto,
  })
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.markAsRead(id, updateNotificationDto);
  }

  @Post('system-announcement')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create system announcement' })
  @ApiResponse({ status: 201, description: 'System announcement created.' })
  async createSystemAnnouncement(
    @Body() createSystemAnnouncementDto: CreateSystemAnnouncementDto,
  ): Promise<void> {
    return this.notificationService.createSystemAnnouncement(
      createSystemAnnouncementDto,
    );
  }
}
