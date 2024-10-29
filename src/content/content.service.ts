import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Article,
  Category,
  Tag,
  Comment,
  Prisma,
} from 'src/prisma/generated/client';
import { MediaService } from '../media/media.service';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
  ) {}

  async createArticle(data: Prisma.ArticleCreateInput): Promise<Article> {
    // Check if the category exists
    const category = await this.prisma.category.findUnique({
      where: { id: data.category.connect.id },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${data.category.connect.id} not found`,
      );
    }

    // If the category exists, proceed with article creation
    return this.prisma.article.create({
      data,
      include: { author: true, category: true, tags: true },
    });
  }

  async getArticle(id: number): Promise<Article | null> {
    return this.prisma.article.findUnique({
      where: { id },
      include: { author: true, category: true, tags: true, comments: true },
    });
  }

  async updateArticle(
    id: number,
    data: Prisma.ArticleUpdateInput,
  ): Promise<Article> {
    return this.prisma.article.update({
      where: { id },
      data,
      include: { author: true, category: true, tags: true },
    });
  }

  async deleteArticle(id: number): Promise<Article> {
    return this.prisma.article.delete({
      where: { id },
      include: { author: true, category: true, tags: true },
    });
  }

  async getArticles(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ArticleWhereInput;
    orderBy?: Prisma.ArticleOrderByWithRelationInput;
  }): Promise<Article[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.article.findMany({
      skip,
      take,
      where,
      orderBy,
      include: { author: true, category: true, tags: true },
    });
  }

  async createCategory(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  async getCategories(): Promise<Category[]> {
    return this.prisma.category.findMany();
  }

  async createTag(data: Prisma.TagCreateInput): Promise<Tag> {
    return this.prisma.tag.create({ data });
  }

  async getTags(): Promise<Tag[]> {
    return this.prisma.tag.findMany();
  }

  async createComment(data: Prisma.CommentCreateInput): Promise<Comment> {
    // Check if the article exists
    const article = await this.prisma.article.findUnique({
      where: { id: data.article.connect.id },
    });

    if (!article) {
      throw new NotFoundException(
        `Article with ID ${data.article.connect.id} not found`,
      );
    }

    // Check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: data.author.connect.id },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${data.author.connect.id} not found`,
      );
    }

    // If both article and user exist, proceed with comment creation
    return this.prisma.comment.create({
      data,
      include: { author: true, article: true },
    });
  }

  async getComments(articleId: number): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: { articleId },
      include: { author: true },
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const uploadedFile = await this.mediaService.uploadFile(
      file,
      '1dfvxaBzly84KrJgEskJFcQz_kXxVR4aQ',
    );
    return uploadedFile.url;
  }
}
