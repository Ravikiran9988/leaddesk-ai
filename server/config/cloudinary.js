import { v2 as cloudinary } from 'cloudinary';

const isConfigured = () =>
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

export const configureCloudinary = () => {
  if (!isConfigured()) {
    console.warn('[Cloudinary] Missing credentials. File uploads will be disabled.');
    return false;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return true;
};

export { cloudinary, isConfigured };
