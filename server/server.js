// ============================================
// server.js - Entry Point
// ============================================
// Loads environment variables, connects to MongoDB,
// and starts the Express server.
// ============================================

import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.config.js";

const PORT = process.env.PORT || 5000;

// Catch unhandled promise rejections so the process never silently crashes
// (a crash produces ERR_CONNECTION_RESET instead of a proper 500 response)
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection] Uncaught promise rejection:", reason);
  // Do NOT exit — let Express keep serving other requests
});

process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err.message, err.stack);
});

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`\n Server is running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(` URL: http://localhost:${PORT}\n`);
    });

    // Gemini API calls (especially ATS score) can take 30-90 seconds.
    // Express 5 default keep-alive timeout is too short → causes ERR_CONNECTION_RESET.
    // Set both timeouts to 120 seconds to cover even the slowest AI responses.
    server.setTimeout(120_000);        // socket idle timeout
    server.keepAliveTimeout = 120_000; // HTTP keep-alive timeout
    server.headersTimeout = 125_000;   // must be slightly > keepAliveTimeout
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
