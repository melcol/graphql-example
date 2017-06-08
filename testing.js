var newman = require('newman');
var fs = require('fs')
const attempts = 200;
const collection = JSON.parse(fs.readFileSync("./Graphql.postman_collection.json"));

const options = {
  collection: collection,
  reporters: ['cli']
};

function runSingleTest(){
  return new Promise(function(resolve,reject){

    //generating random number for the requests
    var rand = Math.floor(Math.random() * (999999));

    hi = JSON.parse(collection.item[0].request.body.raw)
    hi.query = '{ \n  fetchArticle(id:'+rand+'){\n     id\n    title \n    body\n  }\n}'
    collection.item[0].request.body.raw = JSON.stringify(hi);

    newman.run(options, function(error,summary){
      if(error){
        console.log("ERROR: " + error);
        reject(error);
      }
      resolve(summary);
    } );

  });
}


async function beginTest(){
  var multiFileSum = 0;
  for(i=0; i<attempts; i++){
    await runSingleTest()
    .then(function(summary){
      multiFileSum += summary.run.executions[0].response.responseTime;
    }).catch(function(error){
      console.log(error);
    })
  }
  console.log("*******************************\nTest run average: " + multiFileSum/attempts + "\n*******************************")
}
beginTest();
