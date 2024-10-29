import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Prisma, User, Role } from 'src/prisma/generated/client';
import { GetUsersQueryDto } from './dto/user.dto';
import { FileUploadDto } from '../media/dto/file-upload.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  async createUser(@Body() userData: Prisma.UserCreateInput): Promise<User> {
    return this.userService.createUser(userData);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  async getAllUsers(@Query() query: GetUsersQueryDto): Promise<{
    users: Omit<User, 'password'>[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { page = 1, pageSize = 10, sortBy, sortOrder = 'asc' } = query;
    const skip = (page - 1) * pageSize;

    let orderBy: Prisma.UserOrderByWithRelationInput | undefined;
    if (sortBy) {
      orderBy = { [sortBy]: sortOrder };
    }

    const { users, total } = await this.userService.users({
      skip,
      take: pageSize,
      orderBy,
    });

    return {
      users,
      total,
      page,
      pageSize,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserById(@Param('id') id: string): Promise<User | null> {
    return this.userService.user({ id: Number(id) });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUser(
    @Param('id') id: string,
    @Body() userData: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.userService.updateUser({
      where: { id: Number(id) },
      data: userData,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async deleteUser(@Param('id') id: string): Promise<User> {
    return this.userService.deleteUser({ id: Number(id) });
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.uploadAvatar(req.user.userId, file);
  }
}
