const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');
const { parse } = require('path');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

//Might be able to use an array for home screen, and object with  
const currentPlayers = {} // For all of the responses for long polling.

const urlStruct = {
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCSS,
  '/bundle.js': htmlHandler.getBundle,
  notFound: jsonHandler.notFound,
  '/newGame': jsonHandler.newGame,
  '/getOtherPlayer': jsonHandler.getOtherPlayer,
  '/getGameList': jsonHandler.getGameList,
  '/lookForGames': jsonHandler.lookForGames,
  '/joinGame': jsonHandler.joinGame,
  '/quitGame': jsonHandler.quitGame,
  '/sendMessage': jsonHandler.sendMessage,
  '/getMessage': jsonHandler.getMessage,
  //itwasthesame
  //playagain // Implement last -- might not add (not enuf time)
};

//Change to long polling!!! (unless client is asking for html, css, or bundle.)
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);

  if (urlStruct[parsedUrl.pathname]) {
    urlStruct[parsedUrl.pathname](request, response, params);
  } else {
    urlStruct.notFound(request, response, params);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});