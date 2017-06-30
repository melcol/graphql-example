var newman = require('newman');
var fs = require('fs')

const attempts = 2
const fileNumber = 10;

const collection = JSON.parse(fs.readFileSync("./Graphql.postman_collection.json"));

const options = {
  collection: collection,
  reporters: ['cli']
};

function runSingleTest(testingQuery){
  return new Promise(function(resolve,reject){

    //generating random number for the requests
    var randFrom = Math.floor(Math.random() * (fileNumber-1));
    var randTo = Math.floor(Math.random() * (20))+randFrom;
    hi = JSON.parse(collection.item[0].request.body.raw)
    hi.query = '{ \n  '+testingQuery+'(list:"randomOrder",from:'+randFrom+', to:'+randTo+'){\n     id\n    title \n    body\n  }\n}'
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
  var multiFileRedisSum = 0;
  for(i=0; i<attempts; i++){
    await runSingleTest("fetchMultiArticles")
    .then(function(summary){
      multiFileSum += summary.run.executions[0].response.responseTime;
    }).catch(function(error){
      console.log(error);
    });
    await runSingleTest("fetchMultiRedisArticles")
    .then(function(summary){
      multiFileRedisSum += summary.run.executions[0].response.responseTime;
    }).catch(function(error){
      console.log(error);
    });
  }
  console.log("Testing with: " + fileNumber + " items and running " + attempts+" requests");
  console.log("*******************************\nTest run JSON: " + multiFileSum/attempts +
  "\nTest run Redis:" + multiFileRedisSum/attempts +"\n*******************************")
}
beginTest();
