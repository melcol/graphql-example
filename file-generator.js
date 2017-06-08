var fs = require('fs');
var randomstring = require("randomstring");
var randomWords = require('random-words');




function generate(fileNumber, folderName, bigFile){
  return new Promise(function(resolve,reject){
    if (!fs.existsSync(folderName)){
      fs.mkdirSync(folderName);
    }
    var object={};
    var list = [];
    for(var i=0; i<fileNumber; i++){
      object["id"] = i;
      object["title"] = randomWords(3).toString();
      object["body"] = randomstring.generate(1000);

      fs.writeFileSync(folderName+"/"+i+".json", JSON.stringify(object),(error)=>{
        if(error){
          console.log("ERROR " + error)
          reject(error)
        }
      })

      if(i==fileNumber-1){
        resolve()
      }
    }
  });
}


module.exports = {
  generate
}
