import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { initSocketGateway } from './socket/socket.gateway.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const httpServer = http.createServer(app);

    // Initialize Socket.IO Gateway
    initSocketGateway(httpServer);

    const PORT = env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
      console.log(`REST API: http://localhost:${PORT}/api`);
      console.log(`WebSocket Gateway Ready`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
