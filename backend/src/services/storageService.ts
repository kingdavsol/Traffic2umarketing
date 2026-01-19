/**
 * Storage Service
 * Supports multiple storage backends: local, S3, Cloudinary
 * Configure via environment variables:
 * - STORAGE_TYPE: 'local' | 's3' | 'cloudinary' (default: 'local')
 * - For S3: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_REGION
 * - For Cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../config/logger';

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// Ensure upload directory exists for local storage
if (STORAGE_TYPE === 'local') {
  const uploadPath = path.join(process.cwd(), UPLOAD_DIR);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
}

interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  size: number;
}

interface StorageProvider {
  upload(buffer: Buffer, filename: string, mimeType: string): Promise<UploadResult>;
  delete(publicId: string): Promise<boolean>;
  getUrl(publicId: string): string;
}

/**
 * Local File Storage
 */
class LocalStorage implements StorageProvider {
  private uploadPath: string;
  private baseUrl: string;

  constructor() {
    this.uploadPath = path.join(process.cwd(), UPLOAD_DIR);
    this.baseUrl = process.env.API_URL || 'http://localhost:5000';
  }

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    const ext = mimeType.split('/')[1] || 'jpg';
    const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8);
    const timestamp = Date.now();
    const safeFilename = `${timestamp}-${hash}.${ext}`;
    const filePath = path.join(this.uploadPath, safeFilename);

    await fs.promises.writeFile(filePath, buffer);

    return {
      url: `${this.baseUrl}/${UPLOAD_DIR}/${safeFilename}`,
      publicId: safeFilename,
      format: ext,
      size: buffer.length,
    };
  }

  async delete(publicId: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadPath, publicId);
      await fs.promises.unlink(filePath);
      return true;
    } catch (error) {
      logger.error('Local delete error:', error);
      return false;
    }
  }

  getUrl(publicId: string): string {
    return `${this.baseUrl}/${UPLOAD_DIR}/${publicId}`;
  }
}

/**
 * AWS S3 / S3-Compatible Storage
 * Note: Requires @aws-sdk/client-s3 to be installed for S3 functionality
 */
class S3Storage implements StorageProvider {
  private bucketName: string;
  private region: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET || 'quicksell-uploads';
    this.region = process.env.AWS_REGION || 'us-east-1';
  }

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    try {
      // Dynamic import to avoid requiring aws-sdk if not using S3
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const awsS3 = await import('@aws-sdk/client-s3').catch(() => null) as any;

      if (!awsS3) {
        throw new Error('AWS SDK not installed. Please install @aws-sdk/client-s3 for S3 storage.');
      }

      const { S3Client, PutObjectCommand } = awsS3;

      const client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      });

      const ext = mimeType.split('/')[1] || 'jpg';
      const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8);
      const timestamp = Date.now();
      const key = `photos/${timestamp}-${hash}.${ext}`;

      await client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
      }));

      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      return {
        url,
        publicId: key,
        format: ext,
        size: buffer.length,
      };
    } catch (error: any) {
      logger.error('S3 upload error:', error);
      throw error;
    }
  }

  async delete(publicId: string): Promise<boolean> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const awsS3 = await import('@aws-sdk/client-s3').catch(() => null) as any;

      if (!awsS3) {
        logger.error('AWS SDK not installed');
        return false;
      }

      const { S3Client, DeleteObjectCommand } = awsS3;

      const client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      });

      await client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: publicId,
      }));

      return true;
    } catch (error) {
      logger.error('S3 delete error:', error);
      return false;
    }
  }

  getUrl(publicId: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${publicId}`;
  }
}

/**
 * Cloudinary Storage
 */
class CloudinaryStorage implements StorageProvider {
  private cloudName: string;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  }

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    // Use fetch to upload to Cloudinary (no SDK dependency)
    const cloudName = this.cloudName;
    const apiKey = process.env.CLOUDINARY_API_KEY || '';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'quicksell';

    // Create signature
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    // Create form data
    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: mimeType }));
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const result = await response.json() as {
      secure_url: string;
      public_id: string;
      format: string;
      bytes: number;
    };

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  }

  async delete(publicId: string): Promise<boolean> {
    try {
      const cloudName = this.cloudName;
      const apiKey = process.env.CLOUDINARY_API_KEY || '';
      const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

      const timestamp = Math.floor(Date.now() / 1000);
      const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        {
          method: 'POST',
          body: formData,
        }
      );

      return response.ok;
    } catch (error) {
      logger.error('Cloudinary delete error:', error);
      return false;
    }
  }

  getUrl(publicId: string): string {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${publicId}`;
  }
}

// Create storage instance based on configuration
function createStorage(): StorageProvider {
  switch (STORAGE_TYPE.toLowerCase()) {
    case 's3':
      logger.info('Using S3 storage backend');
      return new S3Storage();
    case 'cloudinary':
      logger.info('Using Cloudinary storage backend');
      return new CloudinaryStorage();
    default:
      logger.info('Using local file storage backend');
      return new LocalStorage();
  }
}

const storage = createStorage();

/**
 * Upload a file from base64
 */
export async function uploadFromBase64(
  base64Data: string,
  originalFilename?: string
): Promise<UploadResult> {
  // Remove data URL prefix if present
  const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  let mimeType = 'image/jpeg';
  let data = base64Data;

  if (matches) {
    mimeType = matches[1];
    data = matches[2];
  }

  const buffer = Buffer.from(data, 'base64');
  const filename = originalFilename || `image.${mimeType.split('/')[1] || 'jpg'}`;

  return storage.upload(buffer, filename, mimeType);
}

/**
 * Upload a file from buffer
 */
export async function uploadFromBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadResult> {
  return storage.upload(buffer, filename, mimeType);
}

/**
 * Delete a file
 */
export async function deleteFile(publicId: string): Promise<boolean> {
  return storage.delete(publicId);
}

/**
 * Get public URL for a file
 */
export function getFileUrl(publicId: string): string {
  return storage.getUrl(publicId);
}

export default {
  uploadFromBase64,
  uploadFromBuffer,
  deleteFile,
  getFileUrl,
};
