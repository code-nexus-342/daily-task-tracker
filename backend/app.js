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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({
  logger: process.env.NODE_ENV !== 'production'
});

// Register plugins
await app.register(cors, {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['https://planmorph.onrender.com', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
});

await app.register(multipart);
await app.register(staticFiles, {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads/'
});

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
app.register(userRoutes, { prefix: '/api/users' });
app.register(taskRoutes, { prefix: '/api/tasks', preHandler: authenticate });
app.register(commentRoutes, { prefix: '/api/comments' });

// Health check endpoint
app.get('/health', async () => ({ status: 'ok' }));

// Error handling
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);
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
  app.log.error('Unhandled Promise Rejection:', err);
  // Don't crash the server in production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Sync database
try {
  await sequelize.sync();
  app.log.info('Database synced');
} catch (err) {
  app.log.error('DB sync error:', err);
  // Don't crash the server in production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

const PORT = process.env.PORT || 10000;
try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  app.log.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

export default app;