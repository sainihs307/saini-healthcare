import { v2 as cloudinaryV2 } from 'cloudinary';
import multer from 'multer';
import { Request } from 'express';

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WEBP and PDF files are allowed'));
    }
  },
});

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string,
  fileName: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    cloudinaryV2.uploader
      .upload_stream(
        {
          folder: `saini-healthcare/${folder}`,
          public_id: fileName,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      )
      .end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinaryV2.uploader.destroy(publicId);
};