import type { EagerCollection, Json, Values, Resource } from '@skipruntime/core';

import { Post, User } from '../db/models.js';

/**
 * Post with author details from reactive join with users table.
 * @see https://skiplabs.io/docs/functions for reactive joins
 */
type PostWithAuthor = {
  id: number;
  title: string;
  content: string;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  author: {
    name: string;
    email: string;
  };
  [key: string]: string | number | { name: string; email: string };
};

/**
 * Reactively joins posts with user data. Auto-updates when users or posts change.
 * @see https://skiplabs.io/docs/functions for reactive mappers
 */
class PostsMapper {
  /**
   * @param users - Reactive collection of users indexed by ID
   */
  constructor(private users: EagerCollection<number, User>) {}

  /**
   * Reactively maps post to include author info. Called when posts or users change.
   */
  mapEntry(key: number, values: Values<Post>): Iterable<[number, PostWithAuthor]> {
    const post: Post = values.getUnique();
    let author;
    try {
      // Reactive join with users
      author = this.users.getUnique(post.author_id);
    } catch {
      // Handle missing authors gracefully
      author = {
        username: 'unknown author',
        email: 'unknown email',
      };
    }
    return [
      [
        key,
        {
          id: post.id,
          title: post.title,
          content: post.content,
          status: post.status,
          published_at: post.published_at,
          created_at: post.created_at,
          updated_at: post.updated_at,
          author: {
            name: author.username,
            email: author.email,
          },
        },
      ],
    ];
  }
}

type PostsResourceInputs = {
  posts: EagerCollection<number, PostWithAuthor>;
};

type PostsResourceParams = { limit?: number };

/**
 * Exposes paginated posts data to clients with reactive updates.
 * @see https://skiplabs.io/docs/resources for resource patterns
 */
class PostsResource implements Resource<PostsResourceInputs> {
  private limit: number;

  /**
   * @param jsonParams - Configuration including pagination limits
   */
  constructor(jsonParams: Json) {
    const params = jsonParams as PostsResourceParams;
    if (params.limit === undefined) this.limit = 25;
    else this.limit = params.limit;
  }

  /**
   * Applies pagination limit to posts collection.
   */
  instantiate(collections: PostsResourceInputs): EagerCollection<number, PostWithAuthor> {
    return collections.posts.take(this.limit);
  }
}

type PostsServiceInputs = Record<string, never>;

export { PostsServiceInputs, PostsResource, PostsResourceInputs, PostsMapper };
