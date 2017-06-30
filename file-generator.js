var fs = require('fs');
var randomstring = require("randomstring");
var randomWords = require('random-words');
var redis = require('./redis');

const listName = "randomOrder"

function createList(fileNumber, list){
  return new Promise(function(resolve,reject){
    list.sort(function(a,b){
      return a.rand-b.rand;
    });

    fs.writeFileSync("./"+listName+".json", JSON.stringify(list));
    for(var i=1; i<fileNumber; i++){
      if(i==fileNumber-1){
        resolve();
      }
    }
  });
}

function generate(fileNumber, folderName, bigFile){
  return new Promise(async function(resolve,reject){
    if (!fs.existsSync(folderName)){
      fs.mkdirSync(folderName);
    }
    var object={};
    var list = [];
    var randomPosition;
    for(var i=0; i<fileNumber; i++){
      object["id"] = i;
      object["title"] = randomWords(3).toString();
      object["body"] = randomstring.generate(10);
      randomPosition = Math.floor(Math.random() * fileNumber);
      await redis.addItem(object, listName, fileNumber, randomPosition);

      list.push({
        "rand": randomPosition,
        "id":object.id
      });

      fs.writeFileSync(folderName+"/"+i+".json", JSON.stringify(object));

      if(i==fileNumber-1){
        await createList(fileNumber, list).catch((error)=>{reject(error)});
        resolve()
      }
    }
  });
}


module.exports = {
  generate
}
