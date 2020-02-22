const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const { Kind } =require('graphql/language');

const typeDefs = gql`
  scalar Date

  enum Status {
    WATCHED
    INTERESTED
    NOT_INTERESTED
    UNKNOWN
  }

  type Actor{
    id: ID!
    name: String!
  }

  type Movie {
    id: ID!
    title: String!
    releaseDate: Date
    rating: Int
    status: Status
    actors: [Actor]
  }

  type Query {
    movies: [Movie]
    movie(id: ID): Movie
  }
  type Mutation {
    addMovie(id: ID, title: String, releaseDate: Date): [Movie]
  }
`
const actors = [{
  id: 'liukang',
  name: 'Liu Kang',
}];

const movies = [
  {
    id: 'one',
    title: 'five deadly venoms',
    releaseDate: new Date("10-12-1983"),
    rating: 5,
    actors: [
      {
      id: 'jet',
      name: 'Jet Lee',
      },
      {
        id: 'bruce',
        name: 'lee'
      }
    ]
  },
  {
    id: 'two',
    title: '36 chamber',
    releaseDate: new Date("09-13-1985"),
    rating: 5,
    actors: [{
      id: 'liukang',
      name: 'Liu Kang',
    }]
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
    },
  },



  Movie: {
    // actors is a nested entities through Movie
    actors: (obj, arg, context, info) => {
      // DB call
      const actorsIds = obj.actors.map(actor => actor.id);
      const filteredActors = actors.filter(actor => {
        return actorsIds.includes(actor.id);
      });
      return filteredActors;
    }
  },

  Mutation: {
    addMovie: (obj, { id, title, releaseDate }, context) => {
      // do mutation and/or DB stuff
      const newMoviesList = [
        ...movies,
        // new movie data
        {
          id,
          title,
          releaseDate,
        }
      ];
      // Return dat as expected in the schema
      return newMoviesList;
    }
  },

  Date: new GraphQLScalarType({
    name: 'Date',
    description: "It's a date",
    parseValue(value) {
      // value from the client
      // tranform string "13-09-1985" into a date
      return new Date(value)
    },
    serialize(value) {
      // value sent to the client
      // Transform as timestamp for the client
      return value.getTime()
    },
    // parseLiteral(ast) {
    //   if(ast.kind === Kind.INT) {
    //     return new Date(ast.value)
    //   }
    //   return null
    // }
  })
}

const server = new ApolloServer({ typeDefs, resolvers, introspection: true, playground: true });

server.listen({
  port: process.env.PORT || 4000
}).then(({ url }) => {
  console.log(`Server started at ${url}`);
})