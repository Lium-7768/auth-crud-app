import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ description: 'The title of the article' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'The content of the article' })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Whether the article is published',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiProperty({ description: 'The ID of the category' })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: 'The IDs of the tags', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds: number[];
}

export class UpdateArticleDto {
  @ApiProperty({ description: 'The title of the article', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'The content of the article', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Whether the article is published',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiProperty({ description: 'The ID of the category', required: false })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({
    description: 'The IDs of the tags',
    type: [Number],
    required: false,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tagIds?: number[];
}

export class CreateCategoryDto {
  @ApiProperty({ description: 'The name of the category' })
  @IsString()
  name: string;
}

export class CreateTagDto {
  @ApiProperty({ description: 'The name of the tag' })
  @IsString()
  name: string;
}

export class CreateCommentDto {
  @ApiProperty({ description: 'The content of the comment' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'The ID of the article' })
  @IsNumber()
  articleId: number;
}
