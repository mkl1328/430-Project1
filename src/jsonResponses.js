const games = {};
const lookingPlayers = [];

const respondJSON = (request, response, status, object) => {
  console.log('here', status, object)
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

//Not sure if needed
// const respondJSONMeta = (request, response, status) => {
//   response.writeHead(status, { 'Content-Type': 'application/json' });
//   response.end();
// };

const newGame = (request, response, params) => {
  //make new code
  let newCode
  do {
    newCode = Math.floor(Math.random() * 1000);
  } while (games[newCode])
  
  // add code to games obj.
  games[newCode] = {
    turns: 0,
    waiting: true,
    players: {
      p1: {
        face: params.face, // number (for image)
        name: params.name, //string of name.
        response: null,
        submittedWord: null,
        wasTheSame: false,
        playAgain: false,
      },
      p2: {
        face: null,
        name: null,
        response: null,
        submittedWord: null,
        wasTheSame: false,
        playAgain: false,
      },
    },
  }

    const responseJSON = {
    code: `${newCode}`
  }
  //TODO
  //Update lookForGame players.
  console.log('about to update list')
  updateGameList();
  return respondJSON(request, response, 201, responseJSON)
}

const joinGame = (request, response, params) => {
  let responseJSON = {
    message: 'Game was not found. Please Try again',
  }
  
  //Check if game exists and is still open. 
  if(!games[params.code] || !games[params.code].waiting) {
    return respondJSON(request, response, 404, responseJSON)
  } else {
    const players = games[params.code].players;
    players.p2.face = params.face;
    players.p2.name = params.name;

    responseJSON = {
      message: 'Game was successfully joined!',
      player1: {
        name: players.p1.name,
        face: players.p1.face,
      }
    }
    //closes game from others joining.
    games[params.code].waiting = false;

    return respondJSON(request, response, 204, responseJSON)
  }
}

const makeGameList = () => {
  if(JSON.stringify(games) === "{}") return {};
  const obj = {};
  for(let game in games) {
    obj[game] = {
      player: {
        face: games[game].players.p1.face,
        name: games[game].players.p1.name,
      },
    };
  };
  return obj;
}

//Call when a game opens and when a potential game closes.
const updateGameList = () => {
  const responseJSON = makeGameList()

  //While might break if more requests come in while this is going. 
  for (let i = lookingPlayers.length - 1; i >= 0; i--) {
    // console.log('responding to player:', lookingPlayers[i])
    respondJSON(lookingPlayers[i].request, lookingPlayers[i].response, 200, responseJSON);
    lookingPlayers.splice(i, 1);
  }
}

const getGameList = (request, response) => {
  respondJSON(request, response, 200, makeGameList());
}

const lookForGames = (request, response) => {
  //queue lookers into array, and wait for new game to be made. 
  lookingPlayers.push({
    request: request,
    response : response
  })
}

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };
  return respondJSON(request, response, 404, responseJSON);
};

module.exports = {
  newGame,
  joinGame,
  lookForGames,
  getGameList,
  notFound,
}