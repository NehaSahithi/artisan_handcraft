import crypto from 'node:crypto';

/**
 * Escapes special characters in a string for safe usage in MongoDB $regex queries,
 * preventing Regular Expression Denial of Service (ReDoS) vulnerabilities.
 * @param {string} string 
 * @returns {string}
 */
export const escapeRegex = (string) => {
  if (!string) return '';
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * Calculates shipping charges based on subtotal.
 * Free shipping threshold is ₹999, otherwise standard ₹99 charge.
 * @param {number} subtotal 
 * @returns {number}
 */
export const calculateShipping = (subtotal) => {
  return subtotal >= 999 ? 0 : 99;
};

/**
 * Calculates 5% GST (Tax) on a transaction amount, rounded to 2 decimals.
 * @param {number} subtotal 
 * @returns {number}
 */
export const calculateTax = (subtotal) => {
  return Math.round(subtotal * 0.05 * 100) / 100;
};

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 * @returns {string}
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Standardizes Mongoose query pagination across all listings.
 * @param {import('mongoose').Model} model - Mongoose Model
 * @param {Object} filterQuery - MongoDB filter criteria
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @param {string|Object} populateOptions - Mongoose population string or config
 * @param {Object} sortOptions - Mongoose sort criteria
 * @returns {Promise<{results: Array, pagination: {page: number, limit: number, total: number, pages: number}}>}
 */
export const paginateQuery = async (
  model, 
  filterQuery = {}, 
  page = 1, 
  limit = 12, 
  populateOptions = '',
  sortOptions = { createdAt: -1 }
) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 12);
  const skip = (pageNum - 1) * limitNum;

  const total = await model.countDocuments(filterQuery);
  const pages = Math.ceil(total / limitNum);

  let queryBuilder = model.find(filterQuery).sort(sortOptions).skip(skip).limit(limitNum);

  if (populateOptions) {
    queryBuilder = queryBuilder.populate(populateOptions);
  }

  const results = await queryBuilder;

  return {
    results,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages
    }
  };
};
