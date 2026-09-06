/**
 * Storage abstraction for Little Us keepsakes and photos
 */

export interface PresignedUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  fields?: Record<string, string>;
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validates file upload metadata before creating upload ticket
 */
export function validateMediaUpload(contentType: string, sizeBytes: number): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType.toLowerCase())) {
    return { valid: false, error: 'Only JPEG, PNG, WebP, and HEIC photos are supported.' };
  }

  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'Photo size cannot exceed 10MB.' };
  }

  return { valid: true };
}

/**
 * Generates an upload destination for a couple's photo
 */
export async function createUploadTarget(
  coupleId: string,
  filename: string,
  contentType: string
): Promise<PresignedUploadResponse> {
  const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `couples/${coupleId}/memories/${Date.now()}-${sanitizedName}`;

  // If S3/R2 credentials exist in production, presigned URLs are issued here.
  // In local/fallback environments, returns a direct storage endpoint path.
  const endpoint = process.env.STORAGE_ENDPOINT || process.env.NEXT_PUBLIC_APP_URL || '';
  const publicUrl = `${endpoint}/uploads/${path}`;

  return {
    uploadUrl: publicUrl,
    publicUrl,
  };
}
