const fs = require('fs');
const path = require('path');

const serveFile = (response, file, contentType) => {
  response.writeHead(200, { 'Content-Type': contentType });
  response.write(file);
  response.end();
};

const getImage = (request, response) => {
  const file = path.resolve(__dirname, `../media/Missions_Nose.png`);

  fs.readFile(file, (err, data) => {
    if (err) {
      response.writeHead(404)
      return response.end(err);
    }
    serveFile(response, data, 'image/x-png');
  });
}

module.exports = {
  getImage,
}