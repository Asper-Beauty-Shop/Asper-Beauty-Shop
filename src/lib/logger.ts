/**
 * Logger utility for production-safe logging
 * Logs are only output in development mode
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log general information (only in development)
   */
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always logged, important for production debugging)
   */
  error: (...args: unknown[]) => {
    console.error(...args);
  },

  /**
   * Log warnings (always logged, important for production debugging)
   */
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};
