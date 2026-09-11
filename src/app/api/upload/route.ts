import { NextRequest, NextResponse } from 'next/server';
import { requireCoupleAuth } from '@/lib/auth/guard';
import { getPlanConfig } from '@/lib/config/plans';
import { uploadBufferToCloudinary, isCloudinaryConfigured } from '@/lib/storage/cloudinary';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/jpg',
  'image/gif',
];

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user & couple space
    const auth = await requireCoupleAuth();

    // 2. Extract uploaded file
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'NO_FILE_PROVIDED', message: 'No image file was provided in the upload request.' },
        { status: 400 }
      );
    }

    // 3. Validate image format
    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          error: 'INVALID_FILE_TYPE',
          message: 'Only JPG, PNG, WebP, HEIC, and GIF photos are supported.',
        },
        { status: 400 }
      );
    }

    // 4. Enforce package/tier-based size limits
    const planConfig = getPlanConfig(auth.tier);
    const maxSizeBytes = planConfig.maxMediaSizeMb * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        {
          error: 'FILE_TOO_LARGE',
          message: `Photo size (${fileSizeMb} MB) exceeds your ${planConfig.name} package limit of ${planConfig.maxMediaSizeMb} MB. Upgrade your sanctuary package for larger photo sizes.`,
          tier: auth.tier,
          maxMediaSizeMb: planConfig.maxMediaSizeMb,
          fileSizeMb,
        },
        { status: 400 }
      );
    }

    // 5. Ensure Cloudinary credentials are set up
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error: 'CLOUDINARY_NOT_CONFIGURED',
          message:
            'Cloudinary is not configured yet. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file.',
        },
        { status: 500 }
      );
    }

    // 6. Convert file to buffer and stream directly to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const folderPath = `little-us/couples/${auth.coupleId}/memories`;
    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);

    const result = await uploadBufferToCloudinary(buffer, {
      folder: folderPath,
      filename: `${Date.now()}-${cleanFileName}`,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';

    if (message === 'UNAUTHORIZED' || message === 'NO_COUPLE_MEMBERSHIP') {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'You must be signed into a sanctuary to upload photos.' },
        { status: 401 }
      );
    }

    if (message === 'CLOUDINARY_NOT_CONFIGURED') {
      return NextResponse.json(
        {
          error: 'CLOUDINARY_NOT_CONFIGURED',
          message: 'Cloudinary credentials are not configured or incomplete in your .env file.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'UPLOAD_FAILED', message },
      { status: 500 }
    );
  }
}
