require('dotenv').config()
const { ApolloServer, gql, PubSub } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const { Kind } =require('graphql/language');
const mongoose = require('mongoose');
console.log('process.env???', process.env.DB_USER);
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-iyjij.mongodb.net/test?retryWrites=true&w=majority`, {useNewUrlParser: true});
const db = mongoose.connection;

const movieSchema = new mongoose.Schema({
  title: String,
  releaseDate: Date,
  rating: Number,
  status: String,
  actorIds: [String]
});

const MovieModel = mongoose.model('MovieModel', movieSchema);

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

  input ActorInput {
    id: ID
    name: String
  }

  input MovieInput {
    id: ID
    title: String
    releaseDate: Date
    rating: Int
    status: Status
    actors: [ActorInput]
  }

  type Mutation {
    addMovie(movie: MovieInput): [Movie]
  }

  type Subscription {
    movieAdded: Movie
  }
`
// const actors = [{
//   id: 'liukang',
//   name: 'Liu Kang',
// }];

// const movies = [
//   {
//     id: 'one',
//     title: 'five deadly venoms',
//     releaseDate: new Date("10-12-1983"),
//     rating: 5,
//     actors: [
//       {
//       id: 'jet',
//       name: 'Jet Lee',
//       },
//       {
//         id: 'bruce',
//         name: 'lee'
//       }
//     ]
//   },
//   {
//     id: 'two',
//     title: '36 chamber',
//     releaseDate: new Date("09-13-1985"),
//     rating: 5,
//     actors: [{
//       id: 'liukang',
//       name: 'Liu Kang',
//     }]
//   }
// ];

const pubsub = new PubSub();
const MOVIE_ADDED = 'MOVIE_ADDED';

const resolvers = {
  Subscription: {
    movieAdded: {
      subscribe: () => pubsub.asyncIterator([MOVIE_ADDED])
    }
  },

  Query: {
    movies: async() => {
      try {
        const allMovies = await MovieModel.find();
        return allMovies;
      } catch (error) {
        console.log('error???', error);
        return [];
      }
    },
    movie: async (obj, { id }, context, info) => {
      try {
        const foundMovie = await MovieModel.findById(id);
        return foundMovie;
      } catch (error) {
        console.log('error???', error);
        return {};
      }
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
    addMovie: async(obj, { movie }, context) => {
      const newMovie = await MovieModel.create({
        ...movie
      })
      /*
        Subscription is useful for chat app, I guess it is similar as web socket
      */
      pubsub.publish(MOVIE_ADDED, { movieAdded: newMovie });
      const allMovies = await MovieModel.find();
      return allMovies;
      // Return dat as expected in the schema
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: ({ req }) => {
    // Could pull authentication userId and return it to be accessible into any queries mutation
    return {}
  }
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('✅ DB connected ✅');
  server.listen({
    port: process.env.PORT || 4000
  }).then(({ url }) => {
    console.log(`Server started at ${url}`);
  })
});