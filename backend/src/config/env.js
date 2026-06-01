import dotenv from 'dotenv';

// Load env variables
dotenv.config();

export const validateEnv = () => {
  const requiredEnv = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRE',
    'JWT_COOKIE_EXPIRE',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'FRONTEND_URL',
    'ENCRYPTION_KEY'
  ];

  const missingEnv = [];

  requiredEnv.forEach((key) => {
    if (!process.env[key]) {
      missingEnv.push(key);
    }
  });

  if (missingEnv.length > 0) {
    console.error('❌ CRITICAL ERROR: Missing required environment variables:');
    missingEnv.forEach((key) => {
      console.error(`   - ${key}`);
    });
    console.error('Please configure them in your .env file before starting the server.');
    process.exit(1);
  }

  // Check ENCRYPTION_KEY requirements: mongoose-field-encryption requires a valid secret
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (encryptionKey.length < 16) {
    console.error('❌ CRITICAL ERROR: ENCRYPTION_KEY must be at least 16 characters long for secure field-level encryption.');
    process.exit(1);
  }

  // Warn about optional SMTP config (used for verification/resets)
  const smtpEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingSmtp = smtpEnv.filter((key) => !process.env[key]);
  if (missingSmtp.length > 0) {
    console.warn(`⚠️  WARNING: SMTP settings are partially missing (${missingSmtp.join(', ')}). Password resets and email verification will log to console instead of sending real emails.`);
  }

  console.log('✅ Environment variables validated successfully.');
};

export default validateEnv;