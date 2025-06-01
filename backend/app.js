import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import staticFiles from '@fastify/static';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import userRoutes from './routes/user.routes.js';
import taskRoutes from './routes/task.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from './middleware/auth.middleware.js';
import commentRoutes from './routes/comment.routes.js';
import fs from 'fs';
import { createReadStream } from 'fs';
import docsRoutes from './routes/docs.routes.js';

// Load environment variables first
dotenv.config();

// Log environment variables (excluding sensitive ones)
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not Set',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not Set'
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({
  logger: true // Enable logging in all environments
});

// Register plugins
try {
  await app.register(cors, {
    origin: ['http://localhost:3000', 'https://planmorph.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });
  console.log('CORS plugin registered successfully');

  await app.register(multipart);
  console.log('Multipart plugin registered successfully');

  await app.register(staticFiles, {
    root: path.join(__dirname, 'uploads'),
    prefix: '/uploads/'
  });
  console.log('Static files plugin registered successfully');
} catch (error) {
  console.error('Error registering plugins:', error);
  process.exit(1);
}

// Add download route for files
app.get('/download/:filename', async (request, reply) => {
  const filename = request.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  try {
    await reply.sendFile(filename, path.join(__dirname, 'uploads'));
  } catch (err) {
    app.log.error('Error sending file:', err);
    reply.code(404).send({ error: 'File not found' });
  }
});

// Register routes
try {
  console.log('Registering routes...');
  
  // Register user routes first
  await app.register(userRoutes, { prefix: '/api/users' });
  console.log('User routes registered at /api/users');
  
  // Register other routes
  await app.register(taskRoutes, { prefix: '/api/tasks', preHandler: authenticate });
  console.log('Task routes registered at /api/tasks');
  
  await app.register(commentRoutes, { prefix: '/api/comments' });
  console.log('Comment routes registered at /api/comments');

  await app.register(docsRoutes, { prefix: '/api/docs' });
  console.log('Docs routes registered at /api/docs');

  // Add a test route to verify routing
  app.get('/api/test', async (request, reply) => {
    return { message: 'API is working' };
  });
  console.log('Test route registered at /api/test');

  // Serve files with authentication
  app.get('/uploads/:filename', {
    onRequest: [authenticate],
    handler: async (request, reply) => {
      try {
        const { filename } = request.params;
        const filePath = path.join(__dirname, 'uploads', filename);
        
        // Check if file exists
        try {
          await fs.promises.access(filePath);
        } catch (err) {
          return reply.code(404).send({ message: 'File not found' });
        }

        // Get file stats
        const stats = await fs.promises.stat(filePath);
        
        // Set appropriate headers
        const contentType = filename.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';
        reply.header('Content-Type', contentType);
        reply.header('Content-Length', stats.size);
        // Force inline viewing for PDFs
        reply.header('Content-Disposition', filename.endsWith('.pdf') ? 'inline' : 'attachment');
        reply.header('Cache-Control', 'public, max-age=31536000');
        reply.header('Accept-Ranges', 'bytes');
        
        // Stream the file
        const stream = createReadStream(filePath);
        return reply.send(stream);
      } catch (err) {
        console.error('Error serving file:', err);
        return reply.code(500).send({ message: 'Error serving file' });
      }
    }
  });

} catch (error) {
  console.error('Error registering routes:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/health', async () => ({ status: 'ok' }));

// Error handling
app.setErrorHandler((error, request, reply) => {
  console.error('Request error:', {
    url: request.url,
    method: request.method,
    error: error.message,
    stack: error.stack
  });
  
  const statusCode = error.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong!' 
    : error.message;
  
  reply.code(statusCode).send({ 
    message,
    ...(process.env.NODE_ENV !== 'production' && { error: error.message })
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', {
    error: err.message,
    stack: err.stack
  });
  // Don't crash the server in production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Sync database
try {
  console.log('Attempting to sync database...');
  await sequelize.sync();
  console.log('Database synced successfully');
} catch (err) {
  console.error('Database sync error:', {
    message: err.message,
    stack: err.stack
  });
  // Don't crash the server in production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

// Get port from environment variable or use default
const PORT = process.env.PORT || 5000;

// Start server
try {
  console.log(`Attempting to start server on port ${PORT}...`);
  await app.listen({ 
    port: PORT, 
    host: '0.0.0.0'  // This is important for Render
  });
  console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
} catch (err) {
  console.error('Failed to start server:', {
    message: err.message,
    stack: err.stack,
    port: PORT
  });
  process.exit(1);
}

export default app;