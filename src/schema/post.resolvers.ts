import { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper";
import prisma from "../db";
import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import { AuthContext } from "../libs/auth";

const resolvers: GraphQLResolverMap<AuthContext> = {
  Query: {
    posts: async () => {
      const posts = await prisma.post.findMany();
      return posts;
    },
    post: async (parent: any, args: { id: string }) => {
      const { id } = args;
      const post = await prisma.post.findUnique({
        where: {
          id,
        },
      });
      return post;
    },
  },
  Posts: {
    comments: async (parent: any, args: any) => {
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
    likes: async (parent: any, args: any) => {
      console.log("Post Parent: ", parent);
      const { id } = parent;
      const likes = await prisma.like.findMany({
        where: {
          postId: id,
        },
      });
      return likes;
    },
  },
  Likes: {
    post: async (like: any) => {
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
    posts: async (parent: any, args: any) => {
      console.log("User Parent: ", parent);
      const { id } = parent;
      const posts = await prisma.post.findMany({
        where: {
          userId: id,
        },
      });
      return posts;
    },
    followingFeed: async (parent: any, args: any) => {
      const { id } = parent;
      const { followsIds }: { followsIds: string[] } = parent;
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
      return posts;
    },
  },
  Mutation: {
    createPost: async (parent: any, args: any) => {
      const { content, userId } = args;
      const post = await prisma.post.create({
        data: {
          content,
          userId,
        },
      });
      return post;
    },
    createComment: async (parent: any, args: any) => {
      const { content, postId, userId } = args;
      const comment = await prisma.comment.create({
        data: {
          userId,
          content,
          postId,
        },
      });
      return comment;
    },
    createLike: async (parent: any, args: any) => {
      const { postId, userId } = args;
      const like = await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });
      return like;
    },
  },
};

export default resolvers;
