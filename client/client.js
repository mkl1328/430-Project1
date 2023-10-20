//GENERAL NOTES
//Most likeley a better way to handle the different types of long polling. but due to time, I am keeping them separate.

//There are still a few 'TODO' comments, but those are for a stat's page I didn't have time to implement, and want to in the future.

let localData = {}

const resetLocalData = () => {
  localData = {
    name: localStorage.getItem('STST_name') || 'Guest',
    face: localStorage.getItem('STST_face') || Math.ceil(Math.random()*4),
    //Stats
    state : 'home',
    player : null,
    otherPlayer: null,
    words : [], //For repeat blocking
    turn: 0,
    gameCode : null,
  }
}

const fillTopBar = (whichPlayer, face, name) => {
  document.querySelector(`#${whichPlayer}-face`).src = `/getFace?face=${face}` // add correct picture based on number
  document.querySelector(`#${whichPlayer}-name`).innerHTML = name;
}

const handleGameUpdates = async (update) => {
  switch (update.updateType) {
    case 'recievedWord' : 
    // switch other person's bubble to ready
    document.querySelector("#other-ready").classList.add('ready-message');
    document.querySelector("#other-ready-text").innerHTML = '✔';
      break;
    case 'roundOver' : 
      //construct div with words
      const wordTurn = document.createElement('word-turn');

      wordTurn.innerHTML = `
        <div> 
          <p>${update.words[localData.player]}</p>
        </div>
        <div> 
          <p>${update.words[localData.player === 'p1'? 'p2' : 'p1']}</p>
        </div>
      `
      //add to stack
      wordTurn.style = `order: ${10000 - update.turn}`
      document.querySelector("#message-grid").appendChild(wordTurn);

      //reopen message box + button
      document.querySelector("#send-button").disabled = false;
      document.querySelector("#word-input").disabled = false;
      document.querySelector("#word-input").value = '';
      
      //increment turn counter (data and on screen)
      localData.turn = update.turn;
      document.querySelector("#turns").innerHTML = localData.turn + 1;

      localData.words.push(update.words.p1, update.words.p2)

      //visual bubbles back to not ready
      document.querySelector("#other-ready").classList.remove('ready-message');
      document.querySelector("#my-ready").classList.remove('ready-message');
      document.querySelector("#other-ready-text").innerHTML = '. . .';
      document.querySelector("#my-ready-text").innerHTML = '. . .';
      break;
    case 'winGame' :
      const winningWord = update.words.p1 || update.words.p2;

      //display win screen -
      const winScreen = document.querySelector("#win-overlay");

      document.querySelector("#other-ready").classList.add('ready-message');
      document.querySelector("#my-ready").classList.add('ready-message');
      document.querySelector("#other-ready-text").innerHTML = winningWord;
      document.querySelector("#my-ready-text").innerHTML = winningWord;

      const wordGrid = document.querySelector("#message-grid");

      wordGrid.removeChild(document.querySelector("#message-state-indicator"));
      const finalWord = document.createElement('final-word');
      finalWord.innerHTML = `
        <div id="winning-word-bubble">
          <p id="winning-word"></p>
        </div>
      ` 
      wordGrid.appendChild(finalWord);

      document.querySelector("#winning-word").innerHTML = winningWord

      winScreen.classList.add("active");

      document.querySelector("#results").innerHTML = `It took you and ${localData.otherPlayer} <span style="color:#dab42a">${localData.turn + 1}</span> turns to say the same thing!`
      
        //Add message box to win tab
      let finalMessages = document.createElement('wordsList')
      finalMessages.innerHTML = wordGrid.innerHTML;
      document.querySelector("#replay").appendChild(finalMessages);
      console.log(finalMessages)

      //undisable inputs
      document.querySelector("#send-button").disabled = false;
      document.querySelector("#word-input").disabled = false;
      document.querySelector("#word-input").value = '';

        //future TODO
        //update stats
      break;
    case 'quit' :
      //alert player (maybe a more graceful way) -- but for now alert is easy.
      alert("Sorry, but you were disconnected with your partner! Sending you back to the home screen so you can play another game");
      
      // send back to home
      document.querySelector('#home-page').classList.add('active');
      document.querySelector('#game-page').classList.remove('active');
      document.querySelector('#make-new-game').disabled = false;

      resetBubbles();

      resetLocalData();
      document.querySelector("#turns").innerHTML = localData.turn + 1
      
      updateGameList(await fetch('/getGameList'))
      lookForGames();

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
    if(obj.updateType !== 'quit') return gameLoop();
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
    localData.otherPlayer = obj.player.name
    localData.state = 'inGame'

    document.querySelector("#send-button").disabled = false;
    document.querySelector("#word-input").disabled = false;

    document.querySelector("#waiting-screen").classList.remove('active')
    document.querySelector("#game").classList.add('active')

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
      <img src="/getFace?face=${obj[gameCode].player.face}">
      <h1>${obj[gameCode].player.name}</h1>
      <button data-code="${gameCode}"> <h1 data-code="${gameCode}">Join Game</h1> </button>
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
        localData.otherPlayer = obj.player.name
        localData.gameCode = gameCode

        document.querySelector('#home-page').classList.remove('active');
        document.querySelector('#game-page').classList.add('active');

        document.querySelector("#game").classList.add('active')
        document.querySelector("#waiting-screen").classList.remove('active')

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

const resetBubbles = () => {
  //reset bubbles
  const oldMessages = document.querySelector("#message-grid");
  while(oldMessages.firstChild) {
    oldMessages.removeChild(oldMessages.firstChild);
  }
  const messageIndicator = document.createElement('word-turn')
  messageIndicator.id = 'message-state-indicator'
  messageIndicator.innerHTML = `
    <div id="my-ready"> 
      <p id="my-ready-text">. . .</p>
    </div>
    <div id="other-ready"> 
      <p id="other-ready-text">. . .</p>
    </div>
    `
  oldMessages.appendChild(messageIndicator);
}
 
const init = async () => {
  resetLocalData();
  //Store name and face to local storage
  localStorage.setItem('STST_name', localData.name);
  localStorage.setItem('STST_face', localData.face);

  lookForGames();

  //Populate current open games
  const response = await fetch('/getGameList')
  updateGameList(response)

  // set up buttons
  const newGameButton = document.querySelector("#make-new-game");

  //future TODO
  //Home page stuff here (profile) + stats

  document.querySelector("#home-button").addEventListener('click', async () => {
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
    document.querySelector('#home-page').classList.add('active');
    document.querySelector('#game-page').classList.remove('active');  
    newGameButton.disabled = false;
  });

  const sendMessageButton = document.querySelector("#send-button");
  const messageBox = document.querySelector("#word-input");

  const nameBox = document.querySelector('#name-box');
  nameBox.value = localData.name;

  // Functionality
  const createNewGame = async () => {
    newGameButton.disabled = true;
    
    console.log(localData)
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

      //Add waiting overlay
      document.querySelector("#waiting-screen").classList.add('active')
      document.querySelector("#game").classList.remove('active')

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
    // console.log('sending message')
    const word = messageBox.value.replace(/\s+|[^a-zA-Z]/g, '').toUpperCase();
    
    // check that word isn't empty string;
    if(!word) {
      messageBox.value = ''
      messageBox.placeholder = 'Type something!'
      return
    }

    //No repeat words!! 
    for(let storedWord of localData.words) {
      if(storedWord === word) {
        messageBox.value = ''
        messageBox.placeholder = 'You can\'t reuse words!'
        return
      }
    }

    document.querySelector("#my-ready").classList.add('ready-message');
    document.querySelector("#my-ready-text").innerHTML = '✔';
    messageBox.placeholder = 'Type a word!'
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
      messageBox.placeholder = 'Try again, something went wrong';
      messageBox.value = '';
    }
  }
  sendMessageButton.addEventListener("click", sendMessage)
  messageBox.addEventListener("keydown", (e) => {
    if(e.key === 'Enter') {
      sendMessage();
    }
  })
  messageBox.addEventListener('input', function (e) {
    const inputText = e.target.value;
    const filteredText = inputText.replace(/[^a-zA-Z]/g, '');
  
    if (inputText !== filteredText) {
      e.target.value = filteredText;
    }
  });
  
  nameBox.addEventListener('blur', (e) => {
    let newName = e.target.value.trim();
    if(!newName) {
      e.target.value = 'Guest'
      localStorage.setItem("STST_name", 'Guest')
    }
  });
  nameBox.addEventListener('input', (e) => {
    //Check it's not an empty string
    let newName = e.target.value.trim();
    if(newName) {
      localStorage.setItem("STST_name", newName);
    }
  })

  document.querySelector("#okay-button").addEventListener('click', () => {
    document.querySelector("#win-overlay").classList.remove('active')
    resetLocalData();
    document.querySelector("#turns").innerHTML = localData.turn + 1
    document.querySelector('#home-page').classList.add('active');
    document.querySelector('#game-page').classList.remove('active');  
    newGameButton.disabled = false;
    resetBubbles();
    //Remove messagebox from win tab
    lookForGames();
  })

  window.addEventListener("beforeunload", () => {
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