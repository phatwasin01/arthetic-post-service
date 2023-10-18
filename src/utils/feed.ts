import type { Post, Repost } from "@prisma/client";

enum PostTypeEnum {
  Post = "Post",
  Repost = "Repost",
}
type PostIncludeReposts = ({ Post: Post } & Repost)[];
type FeedPost = {
  id: string;
  userId: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: Date;

  postType: PostTypeEnum;
  repostId?: string;
  repostUserId?: string;
  repostCreatedAt?: Date;
  timestamp: Date;
};
export const ComposeFeed = (
  posts: Post[],
  reposts: PostIncludeReposts | undefined
): FeedPost[] => {
  const postToFeedPost: FeedPost[] = convertManyPostToFeedPost(posts);
  if (!reposts) {
    return postToFeedPost;
  }
  const repostToFeedPost: FeedPost[] = convertRepostsToFeedPost(reposts);
  const composedFeed = repostToFeedPost.concat(postToFeedPost);
  const sortedFeedPostsDesc = sortFeedPostsDesc(composedFeed);
  return sortedFeedPostsDesc;
};

export const convertManyPostToFeedPost = (posts: Post[]): FeedPost[] => {
  return posts.map((post) => {
    return covertOnePostToFeedPost(post);
  });
};

export const convertRepostsToFeedPost = (
  reposts: PostIncludeReposts
): FeedPost[] => {
  return reposts.map((repost) => {
    return {
      id: repost.Post.id,
      content: repost.Post.content,
      userId: repost.Post.userId,
      imageUrl: repost.Post.imageUrl,
      createdAt: repost.Post.createdAt,
      postType: PostTypeEnum.Repost,
      repostId: repost.id,
      repostUserId: repost.userId,
      repostCreatedAt: repost.createdAt,
      timestamp: repost.createdAt,
    };
  });
};

export const covertOnePostToFeedPost = (post: Post): FeedPost => {
  return {
    id: post.id,
    content: post.content,
    userId: post.userId,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    postType: PostTypeEnum.Post,
    timestamp: post.createdAt,
  };
};

export const sortFeedPostsDesc = (posts: FeedPost[]): FeedPost[] => {
  return posts.sort((a, b) => {
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
};
