import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AclModule } from './acl/acl.module';
import { ContentModule } from './content/content.module';
import { NotificationModule } from './notification/notification.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    AclModule,
    ContentModule,
    NotificationModule,
    MediaModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
