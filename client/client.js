const localData = {
  inGame : false,
  player : null,
  
}

const handleResponse = async (response) => {
  //Do the do
}

// const sendFetch = async (url) => {
//   const response = await fetch(url);
//   handleResponse(response);
// };


//Updates game list on homepage with data from lookForGames()
const updateGameList = () => {

}

//Long polling on home page
const lookForGames = async () => {
  let response = await fetch('/lookForGames', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (localData.inGame) return

  if (response.status = 502) {
    await lookForGames();
  } else if (response.status != 200) {
    console.log(response.statusText)
    // IDK if this is needed???
    // used on the website I learned about long polling from
    // await new Promise(resolve => setTimeout(resolve, 1000))
    await lookForGames();
  } else {
    // TODO!!
    // update game list with response data
    await lookForGames();
  }
}

const init = () => {
  // Set all buttons to send fetch requests
  const newGameButton = document.querySelector("#make-new-game");

  // Functionality

  const createNewGame = async () => {
    newGameButton.disabled = true;
    const response = await fetch('/newGame', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (response.status === 201) {

    } else {
      newGameButton.disabled = false;
      alert('There was an issue making your game. Please try again.')
    }
  }

  newGameButton.addEventListener("click", createNewGame);
}

window.onload = init;