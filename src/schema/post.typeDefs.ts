import gql from "graphql-tag";

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  type Posts @key(fields: "id userId repostUserId") {
    id: ID!
    userId: String!
    content: String
    imageUrl: String
    comments: [Comments]
    likes: [Likes]
    createdAt: String

    postType: String
    repostId: String
    repostUserId: String
    repostCreatedAt: String
    timestamp: String

    repostCount: Int
    commentCount: Int
    likeCount: Int

    isUserLiked: Boolean
    isUserReposted: Boolean
  }
  type Comments @key(fields: "id userId") {
    id: ID!
    userId: String!
    content: String
  }
  type Likes @key(fields: "userId") {
    userId: ID!
    post: Posts
  }

  type User @key(fields: "id followsIds") @shareable {
    id: ID!
    posts: [Posts]
    followingFeed: [Posts]
    followsIds: [ID]
  }
  type Query {
    posts: [Posts]
    post(id: ID!): Posts
  }
  type Mutation {
    createPost(content: String, imageUrl: String): Posts
    commentPost(content: String!, postId: String!): Comments
    likePost(postId: String!): Likes
    unlikePost(postId: String!): Boolean
    repostPost(postId: String!): Boolean
  }
`;

export default typeDefs;
