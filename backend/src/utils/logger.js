const fs = require('fs');
const path = require('path');

/**
 * Logs an error to a physical file 'backend/logs/error.log'
 * @param {string} context - The context where the error occurred
 * @param {Error|string} error - The error object or message
 */
function logError(context, error) {
  try {
    const logDir = path.join(__dirname, '..', '..', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFilePath = path.join(logDir, 'error.log');
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.stack : error;
    
    const logLine = `[${timestamp}] [CONTEXT: ${context}] ERROR: ${errorMessage}\n----------------------------------------\n`;
    fs.appendFileSync(logFilePath, logLine, 'utf8');
    
    // Also print to console for development visibility
    console.error(`[LOGGER] ${context}:`, error);
  } catch (logErr) {
    console.error('Failed to write to error log file:', logErr);
  }
}

module.exports = {
  logError
};
