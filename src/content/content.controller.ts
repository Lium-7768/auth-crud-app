import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import {
  Article,
  Category,
  Tag,
  Comment,
  Role,
} from 'src/prisma/generated/client';
import {
  CreateArticleDto,
  UpdateArticleDto,
  CreateCategoryDto,
  CreateTagDto,
  CreateCommentDto,
} from './dto/content.dto';
import { FileUploadDto } from '../media/dto/file-upload.dto';

@ApiTags('content')
@Controller('content')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('articles')
  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create article' })
  @ApiResponse({
    status: 201,
    description: 'The article has been successfully created.',
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createArticle(
    @Request() req,
    @Body() articleData: CreateArticleDto,
  ): Promise<Article> {
    try {
      return await this.contentService.createArticle({
        title: articleData.title,
        content: articleData.content,
        published: articleData.published,
        author: { connect: { id: req.user.userId } },
        category: { connect: { id: articleData.categoryId } },
        tags: { connect: articleData.tagIds.map((id) => ({ id })) },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create article');
    }
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get an article by id' })
  @ApiResponse({ status: 200, description: 'Return the article.' })
  async getArticle(@Param('id') id: string): Promise<Article | null> {
    return this.contentService.getArticle(Number(id));
  }

  @Patch('articles/:id')
  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an article' })
  @ApiResponse({
    status: 200,
    description: 'The article has been successfully updated.',
  })
  async updateArticle(
    @Request() req,
    @Param('id') id: string,
    @Body() articleData: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.contentService.getArticle(Number(id));
    if (req.user.role !== Role.ADMIN && article.authorId !== req.user.userId) {
      throw new ForbiddenException('You can only edit your own articles');
    }
    return this.contentService.updateArticle(Number(id), {
      title: articleData.title,
      content: articleData.content,
      published: articleData.published,
      category: articleData.categoryId
        ? { connect: { id: articleData.categoryId } }
        : undefined,
      tags: articleData.tagIds
        ? { set: articleData.tagIds.map((id) => ({ id })) }
        : undefined,
    });
  }

  @Delete('articles/:id')
  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an article' })
  @ApiResponse({
    status: 200,
    description: 'The article has been successfully deleted.',
  })
  async deleteArticle(
    @Request() req,
    @Param('id') id: string,
  ): Promise<Article> {
    const article = await this.contentService.getArticle(Number(id));
    if (req.user.role !== Role.ADMIN && article.authorId !== req.user.userId) {
      throw new ForbiddenException('You can only delete your own articles');
    }
    return this.contentService.deleteArticle(Number(id));
  }

  @Get('articles')
  @ApiOperation({ summary: 'Get all articles' })
  @ApiResponse({ status: 200, description: 'Return all articles.' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getArticles(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<Article[]> {
    return this.contentService.getArticles({
      skip: Number(skip) || undefined,
      take: Number(take) || undefined,
    });
  }

  @Post('categories')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({
    status: 201,
    description: 'The category has been successfully created.',
  })
  async createCategory(
    @Body() categoryData: CreateCategoryDto,
  ): Promise<Category> {
    return this.contentService.createCategory(categoryData);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Return all categories.' })
  async getCategories(): Promise<Category[]> {
    return this.contentService.getCategories();
  }

  @Post('tags')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create tag' })
  @ApiResponse({
    status: 201,
    description: 'The tag has been successfully created.',
  })
  async createTag(@Body() tagData: CreateTagDto): Promise<Tag> {
    return this.contentService.createTag(tagData);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'Return all tags.' })
  async getTags(): Promise<Tag[]> {
    return this.contentService.getTags();
  }

  @Post('comments')
  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create comment' })
  @ApiResponse({
    status: 201,
    description: 'The comment has been successfully created.',
  })
  @ApiResponse({ status: 404, description: 'Article or User not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createComment(
    @Request() req,
    @Body() commentData: CreateCommentDto,
  ): Promise<Comment> {
    try {
      return await this.contentService.createComment({
        content: commentData.content,
        article: { connect: { id: commentData.articleId } },
        author: { connect: { id: req.user.userId } },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create comment');
    }
  }

  @Get('articles/:id/comments')
  @ApiOperation({ summary: 'Get comments for an article' })
  @ApiResponse({
    status: 200,
    description: 'Return all comments for the article.',
  })
  async getComments(@Param('id') id: string): Promise<Comment[]> {
    return this.contentService.getComments(Number(id));
  }

  @Post('upload-image')
  @Roles(Role.ADMIN, Role.EDITOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload an image' })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.contentService.uploadImage(file);
  }
}
