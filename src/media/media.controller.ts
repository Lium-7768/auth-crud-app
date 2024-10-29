import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
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
import { Role } from 'src/prisma/generated/client';
import { FileUploadDto } from './dto/file-upload.dto';

@ApiTags('media')
@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @Roles(Role.ADMIN, Role.EDITOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.mediaService.uploadFile(file, '290481338262');
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully.' })
  async deleteFile(@Param('id') id: string) {
    await this.mediaService.deleteFile(id);
    return { message: 'File deleted successfully' };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get file info' })
  @ApiResponse({
    status: 200,
    description: 'File info retrieved successfully.',
  })
  async getFileInfo(@Param('id') id: string) {
    return this.mediaService.getFileInfo(id);
  }
}
