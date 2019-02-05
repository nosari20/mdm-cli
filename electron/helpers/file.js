const fs = require('fs'); 

function read(fileName){


    return new Promise(function(resolve, reject) {

      fs.readFile(fileName, 'utf-8', (err, data) => {
        if(err){
          resolve(err);
          return;
        }
        resolve({
          fileName: fileName,
          content: data
        });
      });
    });

}

module.exports = {
  read: read
};