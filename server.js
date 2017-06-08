var graphqlHTTP = require('express-graphql');
var express = require('express');
var graphql= require('./graphql');
var fileGenerator = require("./file-generator")
var app = express();
var logger = require('morgan');


const fileNumber = 1000000;
const JsonFiles = './test_files'
const bigFile = 'bigFile.json';

app.use(logger('dev'));

app.use('/graphql', graphqlHTTP({
  schema: graphql.schema,
  graphiql: true, // disable in production TODO:
}));



fileGenerator.generate(fileNumber, JsonFiles, bigFile)
.then(async function(){
  app.listen(3000, function () {
      console.log('App listening on port 3000');
    });
  }).catch(function(error){
    console.log("Error writting files " + error);
  })
