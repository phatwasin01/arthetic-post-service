import gql from "graphql-tag";

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  type Posts @key(fields: "id userId") {
    id: ID!
    userId: String!
    content: String
    imageUrl: String
    comments: [Comments]
    likes: [Likes]
    createdAt: String
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
    createPost(content: String!, userId: String!): Posts
    createComment(content: String!, postId: String!, userId: String!): Comments
    createLike(postId: String!, userId: String!): Likes
  }
`;

export default typeDefs;
