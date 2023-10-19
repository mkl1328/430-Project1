const fs = require('fs');
const path = require('path');

const fonts = {
  zerocool : fs.readFileSync(`${__dirname}/../media/ZeroCool.woff`),
  kaph : fs.readFileSync(`${__dirname}/../media/Kaph-Regular.woff`),
} 

const serveFile = (response, file, contentType) => {
  response.writeHead(200, { 'Content-Type': contentType });
  response.write(file);
  response.end();
};

const getFace = (request, response, params) => {

  //TODO 
  //Generalize for more images.
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

const getFont = (request, response, params) => {
  serveFile(response, fonts[params.font], 'application/x-font-woff')
}

module.exports = {
  getFace,
  getFont,
}