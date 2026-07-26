const formatTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message, meta = {}) => {
    console.log(`[${formatTimestamp()}] [INFO] ${message}`, Object.keys(meta).length ? meta : '');
  },
  warn: (message, meta = {}) => {
    console.warn(`[${formatTimestamp()}] [WARN] ${message}`, Object.keys(meta).length ? meta : '');
  },
  error: (message, error = {}) => {
    const errorDetails = error?.stack || error?.message || error;
    console.error(`[${formatTimestamp()}] [ERROR] ${message}`, errorDetails);
  },
  http: (req, res, durationMs) => {
    const status = res.statusCode;
    const level = status >= 400 ? 'WARN' : 'INFO';
    console.log(
      `[${formatTimestamp()}] [${level}] ${req.method} ${req.originalUrl} - ${status} (${durationMs}ms)`
    );
  },
};

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req, res, duration);
  });
  next();
};
