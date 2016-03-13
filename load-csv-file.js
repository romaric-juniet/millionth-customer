'use strict';

var loadCsv = function (filename) {
  return new Promise(function (resolve, reject) {
    let array = [];

    let readLine = require('readline').createInterface({
      input: require('fs').createReadStream(filename)
    });

    readLine.on('line', (line) => {
      array.push(line.split(',').map(Number));
    });

    readLine.on('close', function() {
      resolve(array);
    });
  });
}

module.exports = {
  loadCsv: loadCsv
};