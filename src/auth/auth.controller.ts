import {
  Controller,
  Request,
  Post,
  Patch,
  UseGuards,
  Body,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  LoginDto,
  RegisterDto,
  TokenResponseDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Return JWT token',
    type: TokenResponseDto,
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async register(@Body() userData: RegisterDto) {
    return this.authService.register(userData);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password successfully changed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(
      req.user.userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
    return { message: 'Password successfully changed' };
  }
}
