# Movie Graphql Api

### Install
`yarn install`
`nodemon index.js`

### Description
go to http://localhost:4000/
Play with the documented api on the right side

(Work in progress) I will also be deploying the api to heroku

### Notes to go further
`context` argument is any info you want to pass along to all requests
e.g.: user authentication

`ast` Abstract Syntax Tree
=> End result of converting a string into something the api can understand eg: `gql`
Unlikely to need to dive into
* filedname
* fieldnodes
* returnType
* parentType

`fragment` can be use for reusblae part of the schema
=> Cannot be defined in the schema, only in the playground
```fragment Meta on Movie {
  releaseDate
  rating
}

query movies {
  movies{
    id
    ...Meta
  }
}
```

### Database Connection
sandbox mongoDB +
https://mongoosejs.com/docs/

mongodb+srv://sylvain:<password>@cluster0-iyjij.mongodb.net/test?retryWrites=true&w=majority

-- Create an user with write/read access
-- Make sure your ip is whitelisted from the Network Access tab.
Get your ip address:
  `$ curl ifconfig.me`