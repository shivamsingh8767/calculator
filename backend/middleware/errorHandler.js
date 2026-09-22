/**
 * Centralized API Error Handling Middleware
 * Ensures safe, sanitized responses without exposing sensitive credentials, stack traces, or filesystem paths.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }

  // 2. Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((val) => val.message);
    message = `Validation Failed: ${errors.join(', ')}`;
  }

  // 3. Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate entry for ${field}. A record with this value already exists.`;
  }

  // 4. JSON Syntax Error in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload in request body';
  }

  // Log error details securely on the server only
  console.error(`\x1b[31m[API Error ${statusCode}]\x1b[0m ${req.method} ${req.originalUrl}:`, err.message);

  // Return clean, sanitized JSON error response
  res.status(statusCode).json({
    success: false,
    message,
  });
};

