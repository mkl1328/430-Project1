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

  let obj = await response.json();
  if(JSON.stringify(obj) === '{}') return;
  console.log(obj);
  // obj.activeCodes
  //TODO make these into list (scrollable.)
  //Maybe use an html template? 
  // after template is built, add event listener to button.
}

//Long polling on home page
const lookForGames = async () => {
  let response = await fetch('/lookForGames', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (localData.inGame !== 'home') return

  if (response.status = 502) {
    await lookForGames();
  } else if (response.status != 200) {
    console.log(response.statusText)
    console.log("searching again")
    // IDK if this is needed??? (below)
    // used on the website I learned about long polling from
    // await new Promise(resolve => setTimeout(resolve, 1000))
    await lookForGames();
  } else {
    updateGameList(response)
    await lookForGames();
  }
}



const init = async () => {
  resetLocalData();

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
      localData.inGame = 'waiting';
      localData.player = 'p1';
      document.querySelector('#home-page').classList.remove('active');
      document.querySelector('#game-page').classList.add('active');

      let obj = await response.json()
      localData.gameCode = obj.code;

      //TODO
      // INDICATE  wait for other player.
      
      //Call long poll for /getotherplayer
    } else {
      newGameButton.disabled = false;
      alert('There was an issue making your game. Please try again.')
    }
  }

  newGameButton.addEventListener("click", createNewGame);
  lookForGames();
}

window.addEventListener("beforeunload", () => {
  // quit game (if in one) -- differentiate here or on server for waiting game or in game.
  // event.returnValue = "you wanna leave? " -- use if in game
})

window.onload = init;