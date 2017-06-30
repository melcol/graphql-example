var graphql = require('graphql');
var fs = require('fs');
var redis = require('./redis');
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
      fetchRedisArticle:{
        type: servedObjectType,
        args: {
          id: {type: graphql.GraphQLInt}
        },
        resolve: async function (_, { id} ) {
          return new Promise(function(resolve,reject){
          redis.client.zrange(["test", id, id], function(error, results){
            if(error){
              console.log(error)
            }
            resolve(JSON.parse(results))
        });
      })

        }
      },
      fetchHashArticle:{
        type: servedObjectType,
        args: {
          id: {type: graphql.GraphQLInt}
        },
        resolve: async function (_, { id} ) {
          var results = await redis.client.hgetallAsync(id);
          return results;

        }
      },
      fetchMultiArticles:{
        type: new graphql.GraphQLList(servedObjectType),
        args:{
          list: {type: graphql.GraphQLString},
          from: {type: graphql.GraphQLInt},
          to: {type: graphql.GraphQLInt}
        },
        resolve: async function(_, {list, from, to}){
          var items = JSON.parse(fs.readFileSync('./' + list+".json", 'utf8'));
          var results = [];
          for(i=from; i<=to; i++){
            results.push(JSON.parse(fs.readFileSync(JsonFiles + '/' + items[i].id+".json", 'utf8')));
            if(i==to){
              return results;
            }
          }
        }
      },
      fetchMultiRedisArticles:{
        type: new graphql.GraphQLList(servedObjectType),
        args:{
          list: {type: graphql.GraphQLString},
          from: {type: graphql.GraphQLInt},
          to: {type: graphql.GraphQLInt}
        },
        resolve: async function(_, {list, from, to}){
          var commandArray = [];
          var response = await redis.client.zrangeAsync([list, from, to])

          for(i=0; i<response.length; i++){
            commandArray.push ( ["hgetall", response[i] ] );
          }
          var results = await redis.client.batch(commandArray).execAsync();
          return results;
        }
      }


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
