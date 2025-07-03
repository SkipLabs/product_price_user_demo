import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { APIError } from './errors.js';
import { initializeSkipServices } from './skipservice.js';
import userRoutes from './endpoints/users.js';
import postRoutes from './endpoints/posts.js';
import productRoutes from './endpoints/products.js';

const app = Fastify({ logger: true });
const port = 3000;


app.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
  return reply.status(404).type('text/plain').send(`
=== 404 Not Found ===
The thing you asked for isn't here.
¯\\_(ツ)_/¯

`);
});

app.setErrorHandler(async (error: Error, request: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof APIError) {
    return reply.status(error.statusCode).send({
      error: error.name,
      statusCode: error.statusCode,
      details: error.message,
    });
  } else {
    return reply.status(500).send({
      error: 'InternalError',
      statusCode: 500,
      details: 'An unexpected error occurred',
    });
  }
});

const start = async () => {
  try {
    // Initialize Skip services first
    const { server: skipServer, serviceBroker } = await initializeSkipServices();

    // Make serviceBroker and skipServer available to the route handlers BEFORE starting
    app.decorate('serviceBroker', serviceBroker);
    app.decorate('skipServer', skipServer);

    // Register endpoint modules
    await app.register(userRoutes);
    await app.register(postRoutes);
    await app.register(productRoutes);

    // Register plugins
    await app.register(import('@fastify/cors'), {
      origin: true,
    });

    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown handler for:
// - SIGINT: Ctrl+C in terminal
// - SIGTERM: System termination requests (kill command, container orchestration, etc.)
['SIGTERM', 'SIGINT'].forEach((sig) =>
  process.on(sig, async () => {
    const skipServer = (app as any).skipServer;
    if (skipServer) {
      await skipServer.close();
    }
    await app.close();
    console.log('\nServers shut down.');
  })
);
