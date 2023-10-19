let localData = {}

const resetLocalData = () => {
  localData = {
    name: localStorage.getItem('STST_name') || 'guest',
    face: localStorage.getItem('STST_face') || 1,
    //Stats
    state : 'home',
    player : null,
    words : {},
    gameCode : null,
  }
}

const fillTopBar = (whichPlayer, face, name) => {
  //document.querySelector(`#${whichPlayer}-face`) // add correct picture based on number
  document.querySelector(`#${whichPlayer}-name`).innerHTML = name;
}

const handleResponse = async (response) => {
  //Do the do
}

// const sendFetch = async (url) => {
//   const response = await fetch(url);
//   handleResponse(response);
// };


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
    //GameCode on both elements so I can grab it from either element regardless of where the player clicks.]

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

        //TODO populate topbar with both player's info
        fillTopBar('this', localData.face, localData.name);
        fillTopBar('other', obj.player1.face, obj.player1.name);
      }
    })
    //Ideally button is stylized like a green play button or something.
    gameList.appendChild(gameBannerTemplate);
  }
}

//Long polling on home page
const lookForGames = async () => {
  console.log('entered longpoll')
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

  // Set all buttons to send fetch requests
  const newGameButton = document.querySelector("#make-new-game");
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
      // INDICATE  wait for other player.
      
      //TODO
      //Call long poll for /getotherplayer
    } else {
      newGameButton.disabled = false;
      alert('There was an issue making your game. Please try again.')
    }
  }

  newGameButton.addEventListener("click", createNewGame);

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
    //only do so if in a game
  })
}

window.onload = init; 