//GENERAL NOTES
//Most likeley a better way to handle the different types of long polling.

let localData = {}

const resetLocalData = () => {
  localData = {
    name: localStorage.getItem('STST_name') || 'guest',
    face: localStorage.getItem('STST_face') || 1,
    //Stats
    state : 'home',
    player : null,
    words : [], //For repeat blocking
    turn: 0,
    gameCode : null,
  }
}

const fillTopBar = (whichPlayer, face, name) => {
  //document.querySelector(`#${whichPlayer}-face`) // add correct picture based on number
  document.querySelector(`#${whichPlayer}-name`).innerHTML = name;
}

//TODO
const handleGameUpdates = (update) => {
  //Switch case updateType
  switch (update.updateType) {
    case 'recievedWord' : 
    // switch other person's bubble to ready
      break;
    case 'roundOver' : 
      //construct div with words
      //add to stack
      //reopen message box + button
      document.querySelector("#send-button").disabled = false;
      document.querySelector("#word-input").disabled = false;
      //increment turn counter (data and on screen)
      //Add words to localData.words
      //visual bubbles back to not ready
      break;
    case 'winGame' :
      //display win screen -
        // add turn count, final word / words.
        //update stats
        //need button to go home / play again (if i have time)
      break;
    case 'quit' :
      //other player quit
      //alert player (maybe a more graceful way) -- but for now alert is easy.
      // send back to home
      // reset local data 
      break;
    default:
      console.log('something went wrong- updateType was not one of the four regular types. Check spelling: ' + update.updateType);
      break;
  }
}

const gameLoop = async () => {
  let response = await fetch(`/getMessage?code=${localData.gameCode}&player=${localData.player}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (localData.state !== 'inGame') {
    console.log('no longer in a game');
    return;
  }

  if (response.status == 502) {
    console.log("request timed out");
    return gameLoop();
  } else if (response.status != 200) {
    console.log(response.statusText);
    return gameLoop();
  } else {
    let obj = await response.json();
    handleGameUpdates(obj);

    console.log('message recieved')
    return gameLoop();
  }
}

const getOtherPlayer = async () => {
    let response = await fetch(`/getOtherPlayer?code=${localData.gameCode}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (localData.state !== 'waiting') {
    console.log('no longer waiting for partner')
    return;
  }

  if (response.status == 502) {
    console.log("request timed out");
    getOtherPlayer();
  } else if (response.status != 200) {
    console.log(response.statusText)
    getOtherPlayer();
  } else {
    console.log('found a partner!')
    let obj = await response.json()

    fillTopBar('other', obj.player.face, obj.player.name)
    localData.state = 'inGame'

    document.querySelector("#send-button").disabled = false;
    document.querySelector("#word-input").disabled = false;

    gameLoop();
    return
  }
}

//Updates game list on homepage with data from lookForGames()
const updateGameList = async (response) => {
  const gameList = document.querySelector("#game-list"); 
  gameList.innerHTML = "";

  let obj = await response.json();
  if(JSON.stringify(obj) === '{}') return;
  console.log(obj);

  for (let gameCode in obj) {
    const gameBannerTemplate = document.createElement('game-banner');

    gameBannerTemplate.innerHTML = `
      <div class="game-banner">
        <img> </img>
        <h1>${obj[gameCode].player.name}</h1>
        <button data-code="${gameCode}"> <h1 data-code="${gameCode}">Join Game</h1> </button>
      </div>
    `
    //  ^  GameCode on both elements so I can grab it from either element regardless of where the player clicks.]

    //Join game with code 
    gameBannerTemplate.querySelector("button").addEventListener("click", async (event) => {
  
      // console.log(event)
      const gameCode = event.target.getAttribute("data-code")
      // console.log(gameCode)
      const response = await fetch(`/joinGame?code=${gameCode}&name=${localData.name}&face=${localData.face}`, {
        method: 'POST',
        headers: {
          'Accept' : 'application/json'
        },
      });

      if(response.status !== 201) {
        alert("This game is no longer available :( Try another!")
        updateGameList(await fetch('/getGameList'))
      } else {
        console.log(response);
        let obj = await response.json()
        
        localData.state = "inGame"
        localData.player = "p2"
        localData.gameCode = gameCode

        document.querySelector('#home-page').classList.remove('active');
        document.querySelector('#game-page').classList.add('active');

        fillTopBar('this', localData.face, localData.name);
        fillTopBar('other', obj.player.face, obj.player.name);

        gameLoop();
      }
    })
    //Ideally button is stylized like a green play button or something.
    gameList.appendChild(gameBannerTemplate);
  }
}

//Long polling on home page
const lookForGames = async () => {
  //This key  was for debugging, but it magically made everything work. IDK why.
  let key = Math.floor(Math.random() * 1000);
  // console.log("key: "+ key);
  let response = await fetch(`/lookForGames?key=${key}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  console.log(response, localData.state);

  if (localData.state !== 'home') {
    console.log('in game')
    return;
  }

  if (response.status == 502) {
    console.log("request timed out");
    lookForGames();
  } else if (response.status != 200) {
    console.log(response.statusText)
    console.log("searching again")
    // IDK if this is needed??? (below)
    // used on the website I learned about long polling from 
    // await new Promise(resolve => setTimeout(resolve, 1000))
    lookForGames();
  } else {
    console.log('success found games')
    updateGameList(response)
    lookForGames();
  }
}



const init = async () => {
  resetLocalData();
  lookForGames();

  //Populate current open games
  const response = await fetch('/getGameList')
  updateGameList(response)

  // set up buttons
  const newGameButton = document.querySelector("#make-new-game");

  //TODO
  //Home page stuff here (profile) + stats

  const sendMessageButton = document.querySelector("#send-button");
  const messageBox = document.querySelector("#word-input");

  // Functionality
  const createNewGame = async () => {
    newGameButton.disabled = true;
    
    const response = await fetch(`/newGame?name=${localData.name}&face=${localData.face}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',   
      },
    });
    if (response.status === 201) {
      localData.state = 'waiting';
      localData.player = 'p1';
      document.querySelector('#home-page').classList.remove('active');
      document.querySelector('#game-page').classList.add('active');
      
      //populate this player top bar.
      fillTopBar('this', localData.face, localData.name);

      let obj = await response.json()
      localData.gameCode = obj.code;

      //TODO
      //Add waiting overlay
      sendMessageButton.disabled = true;
      messageBox.disabled = true;

      getOtherPlayer()
    } else {
      newGameButton.disabled = false;
      alert('There was an issue making your game. Please try again.')
    }
  }
  newGameButton.addEventListener("click", createNewGame);


  const sendMessage = async () => {
    console.log('sending message')
    //TODO
    //Cross check against wrods array
    //No repeat words!! 

    sendMessageButton.disabled = true;
    messageBox.disabled = true;

    const response = await fetch(`/sendMessage?code=${localData.gameCode}&player=${localData.player}&message=${messageBox.value}`, {
      method: 'POST',
      //Idak if the header part is necessary.. i forget what it does when sending the fetch req.
      headers: {
        'Accept': 'application/json',
      },
    });
    //Probably should use body, but words can only be 20 letters long, so I think we're good

    if(response.status === 204) {
      console.log("Message Sent!")
    } else {
      console.log(response.statusText);
      sendMessageButton.disabled = false;
      messageBox.disabled = false;
      //TODO
      // Try again, something went wrong.
    }
  }
  sendMessageButton.addEventListener("click", sendMessage)
  messageBox.addEventListener("keydown", (event) => {
    if(event.key === 'Enter') {
      sendMessage();
    }
  })

  window.addEventListener("beforeunload", () => {
    console.log(localData.gameCode, localData.state);
    if(localData.gameCode && localData.state !== 'home'){
      console.log('quitting');
      fetch(`/quitGame?code=${localData.gameCode}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
      });
    } 
    resetLocalData();
  })
}

window.onload = init; 