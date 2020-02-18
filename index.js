const { ApolloServer, gql } = require('apollo-server');



const typeDefs = gql`
  enum Status {
    WATCHED
    INTERESTED
    NOT_INTERESTED
    UNKNOWN
  }

  type Movie {
    id: ID
    title: String
    releaseDate: String
    rating: Int
    status: Status
  }

  type Query {
    movies: [Movie]
    movie(id: ID): Movie
  }
`

const movies = [
  {
    id: 'one',
    title: 'five deadly venoms',
    releaseDate: "1983",
    rating: 5
  },
  {
    id: 'two',
    title: '36 chamber',
    releaseDate: "1985",
    rating: 5
  }
];

const resolvers = {
  Query: {
    movies: () => {
      return movies;
    },
    movie: (obj, { id }, context, info) => {
      const movie = movies.find((movie) => movie.id === id)
      return movie;
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers, introspection: true, playground: true });

server.listen({
  port: process.env.Port || 4000
}).then(({ url }) => {
  console.log(`Server started at ${url}`);
})