import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getUserById, getUsers } from '../db/db.js';

interface GetUserParams {
  id: string;
}

interface GetStreamPostsParams {
  uid: string;
}

const SKIP_READ_URL = process.env.SKIP_READ_URL || 'http://localhost:8080';

export default async function userRoutes(app: FastifyInstance) {
  // Get all users
  app.get('/users', async (request: FastifyRequest, reply: FastifyReply) => {
    const users = await getUsers();
    return users;
  });

  // Get user by ID
  app.get<{ Params: GetUserParams }>(
    '/users/:id',
    async (request: FastifyRequest<{ Params: GetUserParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const user = await getUserById(id);
      return user;
    }
  );

  // Stream all users
  app.get('/streams/users', async (request: FastifyRequest, reply: FastifyReply) => {
    const uuid = await (request.server as any).serviceBroker.getStreamUUID('users');
    return reply.redirect(`${SKIP_READ_URL}/v1/streams/${uuid}`, 301);
  });

  // Stream user by UID
  app.get<{ Params: GetStreamPostsParams }>(
    '/streams/users/:uid',
    async (request: FastifyRequest<{ Params: GetStreamPostsParams }>, reply: FastifyReply) => {
      const uid = Number(request.params.uid);
      const uuid = await (request.server as any).serviceBroker.getStreamUUID('users', uid);
      return reply.redirect(`${SKIP_READ_URL}/v1/streams/${uuid}`, 301);
    }
  );

  // Stream users with product sum
  app.get('/streams/usersWithProductSum', async (request: FastifyRequest, reply: FastifyReply) => {
    const uuid = await (request.server as any).serviceBroker.getStreamUUID('usersWithProductSum');
    return reply.redirect(`${SKIP_READ_URL}/v1/streams/${uuid}`, 301);
  });

  // Stream users with product sum by UID
  app.get<{ Params: GetStreamPostsParams }>(
    '/streams/usersWithProductSum/:uid',
    async (request: FastifyRequest<{ Params: GetStreamPostsParams }>, reply: FastifyReply) => {
      const uid = Number(request.params.uid);
      const uuid = await (request.server as any).serviceBroker.getStreamUUID(
        'usersWithProductSum',
        uid
      );
      return reply.redirect(`${SKIP_READ_URL}/v1/streams/${uuid}`, 301);
    }
  );
}