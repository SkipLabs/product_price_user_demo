import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createPost, deletePost, getPostById, publishPost, unpublishPost } from '../db/db.js';

interface GetPostParams {
  id: string;
}

interface GetStreamPostsParams {
  uid: string;
}

interface PostCreateBody {
  title: string;
  content: string;
  author_id: number;
  status: string;
}

interface UpdatePostParams {
  id: string;
}

const SKIP_READ_URL = process.env.SKIP_READ_URL || 'http://localhost:8080';

export default async function postRoutes(app: FastifyInstance) {
  // Get post by ID
  app.get<{ Params: GetPostParams }>(
    '/posts/:id',
    async (request: FastifyRequest<{ Params: GetPostParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const post = await getPostById(id);
      return post;
    }
  );

  // Create post
  app.post<{ Body: PostCreateBody }>(
    '/posts',
    async (request: FastifyRequest<{ Body: PostCreateBody }>, reply: FastifyReply) => {
      const { title, content, author_id, status } = request.body;
      const post = await createPost({
        title,
        content,
        author_id,
        status,
      });
      return post;
    }
  );

  // Publish post
  app.patch<{ Params: UpdatePostParams }>(
    '/posts/:id/publish',
    async (request: FastifyRequest<{ Params: UpdatePostParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const post = await publishPost(id);
      return post;
    }
  );

  // Unpublish post
  app.patch<{ Params: UpdatePostParams }>(
    '/posts/:id/unpublish',
    async (request: FastifyRequest<{ Params: UpdatePostParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const post = await unpublishPost(id);
      return post;
    }
  );

  // Delete post
  app.delete<{ Params: UpdatePostParams }>(
    '/posts/:id',
    async (request: FastifyRequest<{ Params: UpdatePostParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      await deletePost(id);
      return reply.status(204).send();
    }
  );

  // Stream posts by UID
  app.get<{ Params: GetStreamPostsParams }>(
    '/streams/posts/:uid',
    async (request: FastifyRequest<{ Params: GetStreamPostsParams }>, reply: FastifyReply) => {
      const uid = Number(request.params.uid);
      const uuid = await (request.server as any).serviceBroker.getStreamUUID('posts', uid);
      return reply.redirect(`${SKIP_READ_URL}/v1/streams/${uuid}`, 301);
    }
  );

  // Stream all posts
  app.get('/streams/posts', async (request: FastifyRequest, reply: FastifyReply) => {
    const uuid = await (request.server as any).serviceBroker.getStreamUUID('posts');
    return reply.redirect(`${SKIP_READ_URL}/v1/streams/${uuid}`, 301);
  });
}