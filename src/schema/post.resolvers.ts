import { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper";
import prisma from "../db";
import { GraphQLError } from "graphql";
import { AuthContext } from "../libs/auth";
import { ComposeFeed, covertOnePostToFeedPost } from "../utils/feed";
import { checkAuthContextThrowError } from "../utils/context";
const resolvers: GraphQLResolverMap<AuthContext> = {
  Query: {
    posts: async () => {
      const posts = await prisma.post.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      const reposts = await prisma.repost.findMany({
        include: {
          Post: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return ComposeFeed(posts, reposts);
    },
    post: async (parent: unknown, args: { id: string }) => {
      const { id } = args;
      const post = await prisma.post.findUnique({
        where: {
          id,
        },
      });
      if (!post) {
        throw new GraphQLError("Post not found", {
          extensions: {
            code: "NOT_FOUND",
          },
        });
      }
      return covertOnePostToFeedPost(post);
    },
  },
  Posts: {
    comments: async (parent: { id: string }) => {
      const { id } = parent;
      const comments = await prisma.comment.findMany({
        where: {
          postId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return comments;
    },
    likes: async (parent: { id: string }) => {
      console.log("Post Parent: ", parent);
      const { id } = parent;
      const likes = await prisma.like.findMany({
        where: {
          postId: id,
        },
      });
      return likes;
    },
    likeCount: async (parent: { id: string }) => {
      const { id } = parent;
      const likes = await prisma.like.aggregate({
        _count: true,
        where: {
          postId: id,
        },
      });
      return likes._count;
    },
    repostCount: async (parent: { id: string }) => {
      const { id } = parent;
      const reposts = await prisma.repost.aggregate({
        _count: true,
        where: {
          postId: id,
        },
      });
      return reposts._count;
    },
    commentCount: async (parent: { id: string }) => {
      const { id } = parent;
      const comments = await prisma.comment.aggregate({
        _count: true,
        where: {
          postId: id,
        },
      });
      return comments._count;
    },
    isUserLiked: async (parent: { id: string }, args: unknown, context) => {
      console.log("isUserLiked: ", parent, context);
      const { id } = parent;
      if (!context.userId) {
        return false;
      }
      const userId = context.userId;
      const like = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: id,
            userId,
          },
        },
      });
      return !!like;
    },
    isUserReposted: async (parent: { id: string }, args: unknown, context) => {
      const { id } = parent;
      if (!context.userId) {
        return false;
      }
      const userId = context.userId;
      const repost = await prisma.repost.findFirst({
        where: {
          AND: {
            postId: id,
            userId,
          },
        },
      });
      return !!repost;
    },
  },
  Likes: {
    post: async (like: { postId: string }) => {
      console.log("Likes Info: ", like);
      const post = prisma.post.findUnique({
        where: {
          id: like.postId,
        },
      });
      return post;
    },
  },
  User: {
    posts: async (parent: { id: string }) => {
      const { id } = parent;
      const posts = await prisma.post.findMany({
        where: {
          userId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      const reposts = await prisma.repost.findMany({
        where: {
          userId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          Post: true,
        },
      });
      return ComposeFeed(posts, reposts);
    },
    followingFeed: async (parent: { followsIds: string[] }) => {
      const { followsIds } = parent;
      const posts = await prisma.post.findMany({
        where: {
          userId: {
            in: followsIds,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      const reposts = await prisma.repost.findMany({
        where: {
          userId: {
            in: followsIds,
          },
        },
        include: {
          Post: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      const feed = ComposeFeed(posts, reposts);
      return feed;
    },
  },
  Mutation: {
    createPost: async (
      parent: unknown,
      args: { content: string | null; imageUrl: string | null },
      context
    ) => {
      const { content, imageUrl } = args;
      const userId = checkAuthContextThrowError(context);
      if (!content && !imageUrl) {
        throw new GraphQLError("Content or image url are required", {
          extensions: {
            code: "CONTENT_OR_IMAGE_URL_REQUIRED",
          },
        });
      }
      const post = await prisma.post.create({
        data: {
          content,
          imageUrl,
          userId,
        },
      });
      return covertOnePostToFeedPost(post);
    },
    commentPost: async (
      parent: unknown,
      args: { content: string; postId: string },
      context
    ) => {
      const { content, postId } = args;
      const userId = checkAuthContextThrowError(context);
      const comment = await prisma.comment.create({
        data: {
          userId,
          content,
          postId,
        },
      });
      return comment;
    },
    likePost: async (parent: unknown, args: { postId: string }, context) => {
      const { postId } = args;
      const userId = checkAuthContextThrowError(context);
      const like = await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });
      return like;
    },
    unlikePost: async (parent: unknown, args: { postId: string }, context) => {
      const { postId } = args;
      const userId = checkAuthContextThrowError(context);
      const like = await prisma.like.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
      if (like) {
        return true;
      } else {
        return false;
      }
    },
    repostPost: async (parent: unknown, args: { postId: string }, context) => {
      const { postId } = args;
      const userId = checkAuthContextThrowError(context);
      const repost = await prisma.repost.create({
        data: {
          postId,
          userId,
        },
      });
      if (repost) {
        return true;
      } else {
        return false;
      }
    },
  },
};

export default resolvers;
