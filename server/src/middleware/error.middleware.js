// ============================================
// error.middleware.js - Global Error Handling
// ============================================

// Middleware function (Express.js: Middleware)
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`, // Template literal (JS Essentials: Template Literals)
  });
};

// Global error handler (Express.js: Error Handling)
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Log full stack in development for easier debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${statusCode}] ${req.method} ${req.originalUrl}`);
    console.error(err.stack || err.message);
  } else {
    console.error('Error:', err.message);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong on the server.',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
