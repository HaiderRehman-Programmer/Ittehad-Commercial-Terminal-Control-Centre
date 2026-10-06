/**
 * Request/Response Logging Middleware
 */

const logger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`;
    
    if (res.statusCode >= 400) {
      console.error(`❌ ${log}`);
    } else if (duration > 1000) {
      console.warn(`⚠️  ${log}`);
    } else {
      console.log(`✓ ${log}`);
    }
  });

  next();
};

module.exports = { logger };
