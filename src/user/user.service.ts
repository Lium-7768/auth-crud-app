import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { User, Prisma } from 'src/prisma/generated/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
  ) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<{ users: Omit<User, 'password'>[]; total: number }> {
    const { skip, take, cursor, where, orderBy } = params;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    if (data.password) {
      data.password = await bcrypt.hash(data.password as string, 10);
    }
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async uploadAvatar(
    userId: number,
    file: Express.Multer.File,
  ): Promise<Omit<User, 'password'>> {
    const uploadedFile = await this.mediaService.uploadFile(
      file,
      '1dfvxaBzly84KrJgEskJFcQz_kXxVR4aQ',
    );

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: uploadedFile.url,
      },
    });
  }
}
