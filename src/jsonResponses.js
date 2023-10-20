const games = {};
const lookingPlayers = [];

const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  if (request.method !== 'HEAD') response.write(JSON.stringify(object));
  response.end();
};

const makeGameList = () => {
  const obj = {};
  // for (const game of Object.keys(games)) {
  Object.keys(games).forEach((game) => {
    if (games[game].waiting) {
      obj[game] = {
        player: {
          face: games[game].players.p1.face,
          name: games[game].players.p1.name,
        },
      };
    }
  });
  return obj;
};

// Call when a game opens, a game fills, and when a potential game closes.
const updateGameList = () => {
  const responseJSON = makeGameList();

  // While might break if more requests come in while this is going.
  for (let i = lookingPlayers.length - 1; i >= 0; i -= 1) {
    // console.log('iteration: ' + i);
    respondJSON(lookingPlayers[i].request, lookingPlayers[i].response, 200, responseJSON);
    lookingPlayers.splice(i, 1);
  }
};

const newGame = (request, response, params) => {
  // make new code
  let newCode;
  do {
    newCode = Math.floor(Math.random() * 1000);
  } while (games[newCode]);

  // add code to games obj.
  games[newCode] = {
    turns: 0,
    waiting: true,
    readyToCompare: false,
    players: {
      p1: {
        face: params.face, // number (for image)
        name: params.name, // string of name.
        response: null,
        request: null,
        submittedWord: null,
        wasTheSame: false,
        playAgain: false,
      },
      p2: {
        face: null,
        name: null,
        response: null,
        request: null,
        submittedWord: null,
        wasTheSame: false,
        playAgain: false,
      },
    },
  };

  const responseJSON = {
    code: `${newCode}`,
  };

  respondJSON(request, response, 201, responseJSON);
  updateGameList();
};

const getOtherPlayer = (request, response, params) => {
  // add response to player1.response
  if (games[params.code]) {
    games[params.code].players.p1.response = response;
    games[params.code].players.p1.request = request;
  }
  // not sure if request is necessary.
};

const gotOtherPlayer = (params) => {
  const responseJSON = {
    message: 'partner found!',
    player: {
      name: params.name,
      face: params.face,
    },
  };

  const req = games[params.code].players.p1.request;
  const res = games[params.code].players.p1.response;
  respondJSON(req, res, 200, responseJSON);
};

const joinGame = (request, response, params) => {
  const responseJSON = {
    message: 'Game was not found. Please Try again',
  };

  // Check if game exists and is still open.
  if (!games[params.code] || !games[params.code].waiting) {
    return respondJSON(request, response, 404, responseJSON);
  }
  // closes game from others joining.
  games[params.code].waiting = false;
  // store player in games obj.
  const { players } = games[params.code];
  players.p2.face = params.face;
  players.p2.name = params.name;

  responseJSON.message = 'Game was successfully joined!';
  responseJSON.player = {
    name: players.p1.name,
    face: players.p1.face,
  };

  respondJSON(request, response, 201, responseJSON);
  updateGameList();

  return gotOtherPlayer(params);
};

const quitGame = (request, response, params) => {
  const responseJSON = {
    message: 'Game you\'re trying to quit doesn\'t exist',
  };
  // if game doesnt exist, stop.
  if (!games[params.code]) {
    return respondJSON(request, response, 404, responseJSON);
  } if (games[params.code].waiting) {
    // is game still waiting? if so, jsut close
    const req = games[params.code].players.p1.request;
    const res = games[params.code].players.p1.response;
    responseJSON.message = 'closed request, since game closed';
    respondJSON(req, res, 201, responseJSON);
    delete games[params.code];
    responseJSON.message = 'Game closed successfully';
    updateGameList();

    return respondJSON(request, response, 201, responseJSON);
  }
  respondJSON(games[params.code].players.p1.request, games[params.code].players.p1.response, 200, { updateType: 'quit' });
  respondJSON(games[params.code].players.p2.request, games[params.code].players.p2.response, 200, { updateType: 'quit' });

  // remove game from games
  delete games[params.code];

  respondJSON.message = 'quit successfully';
  return respondJSON(request, response, 201, responseJSON);
};

// For when the page loads.
const getGameList = (request, response) => {
  respondJSON(request, response, 200, makeGameList());
};

// Long polling for searching for online waiting games.
const lookForGames = (request, response) => {
  // queue lookers into array, and wait for new game to be made.
  lookingPlayers.push({
    request,
    response,
  });
  // console.log('length : ' + lookingPlayers.length, "key: " + params.key);

  // I'm still not sure why some responses were dropped /
  // why it was taking so long for the server to pick up the requests,
  // however what changed when it started working was,
  // - I added params to the parameteres above.
  // - I sent a key value in the parsed url.
};

// Logs response for future (long polling)
const getMessage = (request, response, params) => {
  if (games[params.code]) {
    games[params.code].players[params.player].response = response;
    games[params.code].players[params.player].request = request;
  }
};

const recieveMessage = (request, response) => {
  const responseJSON = {
    updateType: 'recievedWord',
  };
  respondJSON(request, response, 200, responseJSON);
};

const sendRound = (request, response, game, win) => {
  const responseJSON = {
    updateType: win ? 'winGame' : 'roundOver',
    words: {
      p1: game.players.p1.submittedWord,
      p2: game.players.p2.submittedWord,
    },
    turn: game.turns,
  };
  respondJSON(request, response, 200, responseJSON);
};

// cleans up sent string again in case non-valid strings
// somehow make it to the server (direct url sending)
const unifyWord = (word) => word.replace(/\s+|[^a-zA-Z]/g, '').toUpperCase();

const sendMessage = (request, response, params) => {
  const responseJSON = {
    message: 'Message stored successfully',
  };
  if (games[params.code]) {
    const game = games[params.code];
    // Log message to right person
    game.players[params.player].submittedWord = unifyWord(params.message);

    if (!game.readyToCompare) {
      game.readyToCompare = true;
      // resolve getMessage for other player by sending an update.
      const sendToPlayer = game.players[params.player === 'p2' ? 'p1' : 'p2'];
      recieveMessage(sendToPlayer.request, sendToPlayer.response);
    } else {
      // Reset for next round.
      game.readyToCompare = false;
      game.turns += 1;
      // compare + check for win.
      const theSame = game.players.p1.submittedWord === game.players.p2.submittedWord;
      if (theSame) {
        sendRound(game.players.p1.request, game.players.p1.response, game, true);
        sendRound(game.players.p2.request, game.players.p2.response, game, true);
        delete games[params.code];
      } else {
        sendRound(game.players.p2.response, game.players.p1.response, game);
        sendRound(game.players.p2.response, game.players.p2.response, game);

        game.players.p1.submittedWord = null;
        game.players.p2.submittedWord = null;
      }
    }
  }

  respondJSON(request, response, 204, responseJSON);
};

const notFound = (request, response, params, message) => {
  const responseJSON = {
    message: message || 'The page you are looking for was not found.',
    id: 'notFound',
  };
  return respondJSON(request, response, 404, responseJSON);
};

module.exports = {
  newGame,
  getOtherPlayer,
  joinGame,
  quitGame,
  lookForGames,
  getGameList,
  getMessage,
  sendMessage,
  notFound,
};
