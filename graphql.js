var graphql = require('graphql');
var fs = require('fs');

const JsonFiles = './test_files'
const bigFile = 'bigFile.json';


var Items = [];


var servedObjectType = new graphql.GraphQLObjectType({
  name: 'servedObject',
  fields: function(){
    return {
      id: {
        type: graphql.GraphQLInt
      },
      title: {
        type: graphql.GraphQLString
      },
      body: {
        type: graphql.GraphQLString
      }
    }
  }
});

var queryType = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: function () {
    return {
      fetchArticle: {
        type: servedObjectType,
        args: {
          id: {type: graphql.GraphQLInt}
        },
        resolve: function (_, { id} ) {
          return JSON.parse(fs.readFileSync(JsonFiles + '/' + id+".json", 'utf8'));
        }
      },

    }
  }
});

schema = new graphql.GraphQLSchema({
  query: queryType
});


function loadFiles(directory){
  return new Promise(function(resolve,reject){
    fs.readdir(directory, (err, files) => {
      files.forEach(file => {
        Items.push(JSON.parse(fs.readFileSync(directory + '/' + file, 'utf8')))
      });
    },resolve())

  });
}



module.exports = {
  loadFiles,
  schema
};
