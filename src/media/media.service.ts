import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class MediaService {
  private drive: any;

  constructor(private configService: ConfigService) {
    const base64Credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const credentials = JSON.parse(
      Buffer.from(base64Credentials, 'base64').toString('utf-8'),
    );

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    this.drive = google.drive({ version: 'v3', auth });
  }

  async uploadFile(file: Express.Multer.File, folderId: string): Promise<any> {
    try {
      const fileMetadata = {
        name: file.originalname,
        parents: [folderId],
      };

      const media = {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size, webViewLink',
        uploadType: 'media',
      });

      if (response.status !== 200) {
        throw new InternalServerErrorException(response.data?.error?.message);
      }

      return {
        id: response.data.id,
        name: response.data.name,
        size: response.data.size,
        url: response.data.webViewLink,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.errors[0].message ?? 'Failed to upload file to Google Drive',
      );
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({ fileId });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete file from Google Drive',
      );
    }
  }

  async getFileInfo(fileId: string): Promise<any> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id, name, size, webViewLink',
      });

      return {
        id: response.data.id,
        name: response.data.name,
        size: response.data.size,
        url: response.data.webViewLink,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to get file info from Google Drive',
      );
    }
  }
}
