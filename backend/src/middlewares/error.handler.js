const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error({
    time: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message,
    stack: err.stack
  });

  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    status: 'error',
    message
  });
};

export default errorHandler;
