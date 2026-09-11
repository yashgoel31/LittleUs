import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';
import path from 'path';

function getEnvValue(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(new RegExp(`^${key}=["']?([^"'\r\n]+)["']?`, 'm'));
      if (match && match[1]) {
        process.env[key] = match[1].trim();
        return match[1].trim();
      }
    }
  } catch {
    // ignore
  }
  return undefined;
}

export function isCloudinaryConfigured(): boolean {
  const url = getEnvValue('CLOUDINARY_URL');
  const cloudName = getEnvValue('CLOUDINARY_CLOUD_NAME');
  const apiKey = getEnvValue('CLOUDINARY_API_KEY');
  const apiSecret = getEnvValue('CLOUDINARY_API_SECRET');

  return Boolean(url || (cloudName && apiKey && apiSecret));
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

/**
 * Uploads an image buffer directly to Cloudinary with automatic quality and format optimization.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    filename?: string;
  }
): Promise<CloudinaryUploadResult> {
  const cloudName = getEnvValue('CLOUDINARY_CLOUD_NAME');
  const apiKey = getEnvValue('CLOUDINARY_API_KEY');
  const apiSecret = getEnvValue('CLOUDINARY_API_SECRET');

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('CLOUDINARY_NOT_CONFIGURED');
  }

  // Ensure Cloudinary instance is configured with current credentials
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: 'image',
        public_id: options.filename,
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          const errMsg = error?.message || 'Failed to upload image to Cloudinary';
          console.error('[Cloudinary Upload Error]', errMsg);
          reject(new Error(errMsg));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}
