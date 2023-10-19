const fs = require('fs');
const path = require('path');

const serveFile = (response, file, contentType) => {
  response.writeHead(200, { 'Content-Type': contentType });
  response.write(file);
  response.end();
};

const getFace = (request, response, params) => {

  //TODO add ability to pick from 8(?) faces - use string template
  //Less than 10 bc I dont want to deal with omitted leading 0's (could turn them to strings tbh..)
  const file = path.resolve(__dirname, `../media/face${params.face}.png`);

  fs.readFile(file, (err, data) => {
    if (err) {
      response.writeHead(404)
      return response.end();
    }
    serveFile(response, data, 'image/x-png');
    // just make sure all of the faces are png (also lets me put colored bkgs!)
  });
}

module.exports = {
  getFace,
}