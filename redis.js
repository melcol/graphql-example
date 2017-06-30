var redis = require('redis');

var bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient();


function addItem(object, listName, fileNumber, randomPosition){
  return new Promise(function(resolve,reject){
    client.hmset([object.id,"id", object.id, "title", object.title, "body", object.body], function(error, response){
      if(error){
        console.log(error)
      }
      client.zadd([listName, randomPosition, object.id], function(err,response){
        if(err){
          reject(err)
        }
        else
          resolve();
      })
    });
  })
}

module.exports ={
  client,
  addItem
};
