const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses');
const mediaHandler = require('./mediaResponses');
const jsonHandler = require('./jsonResponses');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/bundle.js': htmlHandler.getBundle,
    notFound: jsonHandler.notFound,

    '/getOtherPlayer': jsonHandler.getOtherPlayer,
    '/getGameList': jsonHandler.getGameList,
    '/lookForGames': jsonHandler.lookForGames,
    '/getMessage': jsonHandler.getMessage,

    '/getFace': mediaHandler.getFace,
    '/getFont': mediaHandler.getFont,
  },
  POST: {
    '/newGame': jsonHandler.newGame,
    '/joinGame': jsonHandler.joinGame,
    '/quitGame': jsonHandler.quitGame,
    '/sendMessage': jsonHandler.sendMessage,

  },
  // itwasthesame
  // playagain // Implement last -- might not add (not enuf time)
};

// Change to long polling!!! (unless client is asking for html, css, or bundle.)
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);

  // TODO
  // Make head requests getable.
  // implement ifs in all of the enedpoints
  const req = request.method === 'HEAD' ? 'GET' : request.method;

  if (urlStruct[req][parsedUrl.pathname]) {
    urlStruct[request.method][parsedUrl.pathname](request, response, params);
  } else {
    urlStruct.GET.notFound(request, response, params);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
