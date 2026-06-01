import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Base helper to generate dynamic Cloudinary storage for different folders
const createCloudinaryStorage = (folder, customAllowedFormats = ['jpg', 'jpeg', 'png', 'webp']) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: customAllowedFormats,
      transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }]
    }
  });
};

// Define Cloudinary storages for different asset domains
const productStorage = createCloudinaryStorage('karigar/products');
const avatarStorage = createCloudinaryStorage('karigar/avatars');
const shopStorage = createCloudinaryStorage('karigar/shops');

// KYC supports PDF as well as images
const kycStorage = createCloudinaryStorage('karigar/kyc', ['jpg', 'jpeg', 'png', 'webp', 'pdf']);

// Generic image filter
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image type. Only JPG, JPEG, PNG, and WEBP are allowed.'), false);
  }
};

// KYC filter (allows PDF)
const kycFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid document type. Only JPG, JPEG, PNG, WEBP, and PDF are allowed for KYC.'), false);
  }
};

// Export specialized upload middlewares
export const uploadProductImages = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: imageFilter
}).array('images', 5);

export const uploadKYCDocs = multer({
  storage: kycStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB (PDFs can be larger)
  fileFilter: kycFilter
}).fields([
  { name: 'aadhaarDoc', maxCount: 1 },
  { name: 'panDoc', maxCount: 1 }
]);

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB
  fileFilter: imageFilter
}).single('avatar');

export const uploadShopMedia = multer({
  storage: shopStorage,
  limits: { fileSize: 4 * 1024 * 1024 }, // Max 4MB
  fileFilter: imageFilter
}).fields([
  { name: 'shopLogo', maxCount: 1 },
  { name: 'shopBanner', maxCount: 1 }
]);
