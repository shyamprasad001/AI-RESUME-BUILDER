// ============================================
// server.js - Entry Point
// ============================================
// Loads environment variables, connects to MongoDB,
// and starts the Express server.
// ============================================

import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.config.js";
import logger from "./src/utils/logger.js";

const PORT = process.env.PORT || 5000;

// Catch unhandled promise rejections so the process never silently crashes
// (a crash produces ERR_CONNECTION_RESET instead of a proper 500 response)
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "[unhandledRejection] Uncaught promise rejection");
  // Do NOT exit — let Express keep serving other requests
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, `[uncaughtException] ${err.message}`);
});

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`URL: http://localhost:${PORT}`);
    });

    // Gemini API calls (especially ATS score) can take 30-90 seconds.
    // Express 5 default keep-alive timeout is too short → causes ERR_CONNECTION_RESET.
    // Set both timeouts to 120 seconds to cover even the slowest AI responses.
    server.setTimeout(120_000);        // socket idle timeout
    server.keepAliveTimeout = 120_000; // HTTP keep-alive timeout
    server.headersTimeout = 125_000;   // must be slightly > keepAliveTimeout
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();
