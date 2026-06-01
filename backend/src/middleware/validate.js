/**
 * Zod validation middleware factory.
 * Validates request components (body, query, params) against provided schemas.
 * 
 * Supports both standalone body schemas (e.g. validate(registerSchema))
 * and combined schemas (e.g. validate({ body: bodySchema, query: querySchema }))
 */
export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body || schema.query || schema.params) {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
    } else {
      // Standalone body validation
      req.body = schema.parse(req.body);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default validate;
