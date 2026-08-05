import { createApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";

(async () => {
  let app: Awaited<ReturnType<typeof createApp>>["app"];
  let httpServer: Awaited<ReturnType<typeof createApp>>["httpServer"];
  try {
    ({ app, httpServer } = await createApp());
  } catch (error) {
    console.error("💥 Failed to initialize application:", error);
    process.exit(1);
  }

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);

  // Validate port number
  if (isNaN(port) || port <= 0 || port > 65535) {
    const errorMsg = `Invalid port number: ${process.env.PORT}. Using default port 5000.`;
    log(errorMsg);
    console.warn(`⚠️  ${errorMsg}`);
  }

  const serverPort = isNaN(port) || port <= 0 || port > 65535 ? 5000 : port;

  httpServer.listen({
    port: serverPort,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`✅ Server started successfully on port ${serverPort}`);
    if (process.env.NODE_ENV === 'production') {
      log(`🚀 Production deployment ready at http://0.0.0.0:${serverPort}`);
    } else {
      log(`🛠️  Development server ready at http://localhost:${serverPort}`);
    }
  }).on('error', (error: any) => {
    console.error('❌ Server failed to start:', error);

    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${serverPort} is already in use. Please:
        1. Choose a different port by setting the PORT environment variable
        2. Stop the process using this port
        3. Wait a moment and try again`);
    } else if (error.code === 'EACCES') {
      console.error(`❌ Permission denied to bind to port ${serverPort}. Please:
        1. Use a port number above 1024
        2. Run with appropriate permissions
        3. Check firewall settings`);
    } else if (error.code === 'ENOTFOUND') {
      console.error(`❌ Network interface not found. Please check network configuration.`);
    } else {
      console.error(`❌ Server startup failed with error code: ${error.code}`);
      console.error(`   Error message: ${error.message}`);
    }

    console.log('\n📋 Troubleshooting tips:');
    console.log('   • Ensure PORT environment variable is set correctly');
    console.log('   • Check that no other process is using the port');
    console.log('   • Verify network configuration and firewall settings');
    console.log('   • For production deployments, ensure all secrets are configured');

    // In production, exit with error code
    if (process.env.NODE_ENV === 'production') {
      console.error('💥 Exiting due to server startup failure in production');
      process.exit(1);
    } else {
      console.warn('⚠️  Development mode: Server startup failed but process continues');
    }
  });
})();
