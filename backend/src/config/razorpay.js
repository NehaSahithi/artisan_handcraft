import Razorpay from 'razorpay';

let razorpayInstance = null;

/**
 * Returns the lazily initialized Razorpay instance.
 * Reads environment variables at call time, avoiding initialization order issues.
 * @returns {Razorpay}
 */
export const getRazorpay = () => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes('change_this') || keySecret.includes('change_this')) {
      throw new Error('Razorpay credentials are not properly configured in environmental variables.');
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayInstance;
};

/**
 * Validates whether the Razorpay keys are configured and are not placeholders.
 * @returns {boolean}
 */
export const hasValidKeys = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) return false;
  if (keyId.includes('change_this') || keySecret.includes('change_this')) return false;
  if (keyId === 'rzp_test_YOUR_KEY_ID' || keySecret === 'YOUR_KEY_SECRET') return false;

  return true;
};
