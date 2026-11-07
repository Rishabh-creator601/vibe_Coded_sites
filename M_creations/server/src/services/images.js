import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config.js';

export const UPLOAD_DIR = 'uploads';
export const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

const { cloudName, apiKey, apiSecret } = config.cloudinary;
const useCloudinary = Boolean(cloudName && apiKey && apiSecret);
if (useCloudinary) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

export async function saveImage(file) {
  if (useCloudinary) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'm-creations', resource_type: 'image' }, (err, res) =>
          err ? reject(err) : resolve(res)
        )
        .end(file.buffer);
    });
    return { url: result.secure_url, publicId: result.public_id };
  }

  const filename = `${randomUUID()}.${IMAGE_TYPES[file.mimetype]}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);
  return { url: `/uploads/${filename}`, publicId: `local:${filename}` };
}

/** Removing the stored file is best effort: a failure must not block saving a product. */
export async function deleteImage({ publicId }) {
  if (!publicId) return;
  try {
    if (publicId.startsWith('local:')) {
      await fs.unlink(path.join(UPLOAD_DIR, path.basename(publicId.slice('local:'.length))));
    } else if (useCloudinary) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    console.warn(`Could not delete image ${publicId}: ${err.message}`);
  }
}
