import { updateDocs } from '../controllers/docs.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export default async function docsRoutes(fastify, options) {
  fastify.post('/update', { preHandler: authenticate }, updateDocs);
} 