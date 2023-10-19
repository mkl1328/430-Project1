/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./client/client.js":
/*!**************************!*\
  !*** ./client/client.js ***!
  \**************************/
/***/ (() => {

eval("//GENERAL NOTES\r\n//Most likeley a better way to handle the different types of long polling.\r\n\r\nlet localData = {}\r\n\r\nconst resetLocalData = () => {\r\n  localData = {\r\n    name: localStorage.getItem('STST_name') || 'Guest',\r\n    face: localStorage.getItem('STST_face') || Math.ceil(Math.random()*8),\r\n    //Stats\r\n    state : 'home',\r\n    player : null,\r\n    words : [], //For repeat blocking\r\n    turn: 0,\r\n    gameCode : null,\r\n  }\r\n}\r\n\r\nconst fillTopBar = (whichPlayer, face, name) => {\r\n  document.querySelector(`#${whichPlayer}-face`).src = `/getFace?face=${face}` // add correct picture based on number\r\n  document.querySelector(`#${whichPlayer}-name`).innerHTML = name;\r\n}\r\n\r\nconst handleGameUpdates = (update) => {\r\n  switch (update.updateType) {\r\n    case 'recievedWord' : \r\n    //TODO\r\n    // switch other person's bubble to ready\r\n      break;\r\n    case 'roundOver' : \r\n      //construct div with words\r\n      const wordTurn = document.createElement('word-turn');\r\n\r\n      wordTurn.innerHTML = `\r\n        <div> \r\n          <p>${update.words[localData.player]}</p>\r\n        </div>\r\n        <div> \r\n          <p>${update.words[localData.player === 'p1'? 'p2' : 'p1']}</p>\r\n        </div>\r\n      `\r\n      //add to stack\r\n      wordTurn.style = `order: ${10000 - update.turn}`\r\n      document.querySelector(\"#message-grid\").appendChild(wordTurn);\r\n\r\n      //reopen message box + button\r\n      document.querySelector(\"#send-button\").disabled = false;\r\n      document.querySelector(\"#word-input\").disabled = false;\r\n      document.querySelector(\"#word-input\").value = '';\r\n      //TODO\r\n      //increment turn counter (data and on screen)\r\n      localData.turn = update.turn;\r\n\r\n      localData.words.push(update.words.p1, update.words.p2)\r\n      //TODO\r\n      //visual bubbles back to not ready\r\n      break;\r\n    case 'winGame' :\r\n      //TODO\r\n      //display win screen -\r\n        // add turn count, final word / words.\r\n        //update stats\r\n        //need button to go home / play again (if i have time)\r\n      break;\r\n    case 'quit' :\r\n      //alert player (maybe a more graceful way) -- but for now alert is easy.\r\n      alert(\"Sorry, but you were disconnected with your partner! Sending you back to the home screen so you can play another game\");\r\n      \r\n      // send back to home\r\n      document.querySelector('#home-page').classList.add('active');\r\n      document.querySelector('#game-page').classList.remove('active');\r\n\r\n      resetLocalData();\r\n      break;\r\n    default:\r\n      console.log('something went wrong- updateType was not one of the four regular types. Check spelling: ' + update.updateType);\r\n      break;\r\n  }\r\n}\r\n\r\nconst gameLoop = async () => {\r\n  let response = await fetch(`/getMessage?code=${localData.gameCode}&player=${localData.player}`, {\r\n    method: 'GET',\r\n    headers: {\r\n      'Accept': 'application/json',\r\n    },\r\n  });\r\n\r\n  if (localData.state !== 'inGame') {\r\n    console.log('no longer in a game');\r\n    return;\r\n  }\r\n\r\n  if (response.status == 502) {\r\n    console.log(\"request timed out\");\r\n    return gameLoop();\r\n  } else if (response.status != 200) {\r\n    console.log(response.statusText);\r\n    return gameLoop();\r\n  } else {\r\n    let obj = await response.json();\r\n    handleGameUpdates(obj);\r\n\r\n    console.log('message recieved')\r\n    return gameLoop();\r\n  }\r\n}\r\n\r\nconst getOtherPlayer = async () => {\r\n    let response = await fetch(`/getOtherPlayer?code=${localData.gameCode}`, {\r\n    method: 'GET',\r\n    headers: {\r\n      'Accept': 'application/json',\r\n    },\r\n  });\r\n\r\n  if (localData.state !== 'waiting') {\r\n    console.log('no longer waiting for partner')\r\n    return;\r\n  }\r\n\r\n  if (response.status == 502) {\r\n    console.log(\"request timed out\");\r\n    getOtherPlayer();\r\n  } else if (response.status != 200) {\r\n    console.log(response.statusText)\r\n    getOtherPlayer();\r\n  } else {\r\n    console.log('found a partner!')\r\n    let obj = await response.json()\r\n\r\n    fillTopBar('other', obj.player.face, obj.player.name)\r\n    localData.state = 'inGame'\r\n\r\n    document.querySelector(\"#send-button\").disabled = false;\r\n    document.querySelector(\"#word-input\").disabled = false;\r\n\r\n    gameLoop();\r\n    return\r\n  }\r\n}\r\n\r\n//Updates game list on homepage with data from lookForGames()\r\nconst updateGameList = async (response) => {\r\n  const gameList = document.querySelector(\"#game-list\"); \r\n  gameList.innerHTML = \"\";\r\n\r\n  let obj = await response.json();\r\n  if(JSON.stringify(obj) === '{}') return;\r\n  console.log(obj);\r\n\r\n  for (let gameCode in obj) {\r\n    const gameBannerTemplate = document.createElement('game-banner');\r\n\r\n    gameBannerTemplate.innerHTML = `\r\n      <img src=\"/getFace?face=${obj[gameCode].player.face}\">\r\n      <h1>${obj[gameCode].player.name}</h1>\r\n      <button data-code=\"${gameCode}\"> <h1 data-code=\"${gameCode}\">Join Game</h1> </button>\r\n    `\r\n    //  ^  GameCode on both elements so I can grab it from either element regardless of where the player clicks.]\r\n\r\n    //Join game with code \r\n    gameBannerTemplate.querySelector(\"button\").addEventListener(\"click\", async (event) => {\r\n  \r\n      // console.log(event)\r\n      const gameCode = event.target.getAttribute(\"data-code\")\r\n      // console.log(gameCode)\r\n      const response = await fetch(`/joinGame?code=${gameCode}&name=${localData.name}&face=${localData.face}`, {\r\n        method: 'POST',\r\n        headers: {\r\n          'Accept' : 'application/json'\r\n        },\r\n      });\r\n\r\n      if(response.status !== 201) {\r\n        alert(\"This game is no longer available :( Try another!\")\r\n        updateGameList(await fetch('/getGameList'))\r\n      } else {\r\n        console.log(response);\r\n        let obj = await response.json()\r\n        \r\n        localData.state = \"inGame\"\r\n        localData.player = \"p2\"\r\n        localData.gameCode = gameCode\r\n\r\n        document.querySelector('#home-page').classList.remove('active');\r\n        document.querySelector('#game-page').classList.add('active');\r\n\r\n        fillTopBar('this', localData.face, localData.name);\r\n        fillTopBar('other', obj.player.face, obj.player.name);\r\n\r\n        gameLoop();\r\n      }\r\n    })\r\n    //Ideally button is stylized like a green play button or something.\r\n    gameList.appendChild(gameBannerTemplate);\r\n  }\r\n}\r\n\r\n//Long polling on home page\r\nconst lookForGames = async () => {\r\n  //This key  was for debugging, but it magically made everything work. IDK why.\r\n  let key = Math.floor(Math.random() * 1000);\r\n  // console.log(\"key: \"+ key);\r\n  let response = await fetch(`/lookForGames?key=${key}`, {\r\n    method: 'GET',\r\n    headers: {\r\n      'Accept': 'application/json',\r\n    },\r\n  });\r\n  console.log(response, localData.state);\r\n\r\n  if (localData.state !== 'home') {\r\n    console.log('in game')\r\n    return;\r\n  }\r\n\r\n  if (response.status == 502) {\r\n    console.log(\"request timed out\");\r\n    lookForGames();\r\n  } else if (response.status != 200) {\r\n    console.log(response.statusText)\r\n    console.log(\"searching again\")\r\n    // IDK if this is needed??? (below)\r\n    // used on the website I learned about long polling from \r\n    // await new Promise(resolve => setTimeout(resolve, 1000))\r\n    lookForGames();\r\n  } else {\r\n    console.log('success found games')\r\n    updateGameList(response)\r\n    lookForGames();\r\n  }\r\n}\r\n\r\n\r\n \r\nconst init = async () => {\r\n  resetLocalData();\r\n  //Store name and face to local storage\r\n  localStorage.setItem('STST_name', localData.name);\r\n  localStorage.setItem('STST_face', localData.face);\r\n\r\n  lookForGames();\r\n\r\n  //Populate current open games\r\n  const response = await fetch('/getGameList')\r\n  updateGameList(response)\r\n\r\n  // set up buttons\r\n  const newGameButton = document.querySelector(\"#make-new-game\");\r\n\r\n  //TODO\r\n  //Home page stuff here (profile) + stats\r\n  //Name - on input, save to localstorage\r\n  //Dont forget to remove leading + trailing spaces;\r\n  // on lose focus, check that it's not empty. if it is, enter Guest\r\n\r\n  document.querySelector(\"#home-button\").addEventListener('click', async () => {\r\n    if(localData.gameCode && localData.state !== 'home'){\r\n      console.log('quitting');\r\n      fetch(`/quitGame?code=${localData.gameCode}`, {\r\n        method: 'POST',\r\n        headers: {\r\n          'Accept': 'application/json',\r\n        },\r\n      });\r\n    } \r\n    resetLocalData();\r\n    document.querySelector('#home-page').classList.add('active');\r\n    document.querySelector('#game-page').classList.remove('active');  \r\n    newGameButton.disabled = false;\r\n  });\r\n\r\n  const sendMessageButton = document.querySelector(\"#send-button\");\r\n  const messageBox = document.querySelector(\"#word-input\");\r\n\r\n  const nameBox = document.querySelector('#name-box');\r\n  nameBox.value = localData.name;\r\n\r\n  // Functionality\r\n  const createNewGame = async () => {\r\n    newGameButton.disabled = true;\r\n    \r\n    console.log(localData)\r\n    const response = await fetch(`/newGame?name=${localData.name}&face=${localData.face}`, {\r\n      method: 'POST',\r\n      headers: {\r\n        'Accept': 'application/json',   \r\n      },\r\n    });\r\n    if (response.status === 201) {\r\n      localData.state = 'waiting';\r\n      localData.player = 'p1';\r\n      document.querySelector('#home-page').classList.remove('active');\r\n      document.querySelector('#game-page').classList.add('active');\r\n      \r\n      //populate this player top bar.\r\n      fillTopBar('this', localData.face, localData.name);\r\n\r\n      let obj = await response.json()\r\n      localData.gameCode = obj.code;\r\n\r\n      //TODO\r\n      //Add waiting overlay\r\n      sendMessageButton.disabled = true;\r\n      messageBox.disabled = true;\r\n\r\n      getOtherPlayer()\r\n    } else {\r\n      newGameButton.disabled = false;\r\n      alert('There was an issue making your game. Please try again.')\r\n    }\r\n  }\r\n  newGameButton.addEventListener(\"click\", createNewGame);\r\n\r\n\r\n  const sendMessage = async () => {\r\n    // console.log('sending message')\r\n    const word = messageBox.value.replace(/\\s+|[^a-zA-Z]/g, '').toUpperCase();\r\n\r\n    //No repeat words!! \r\n    for(let storedWord of localData.words) {\r\n      if(storedWord === word) {\r\n        messageBox.value = ''\r\n        messageBox.placeholder = 'You can\\'t reuse words!'\r\n        return\r\n      }\r\n    }\r\n\r\n    messageBox.placeholder = 'Type a word!'\r\n    sendMessageButton.disabled = true;\r\n    messageBox.disabled = true;\r\n\r\n    const response = await fetch(`/sendMessage?code=${localData.gameCode}&player=${localData.player}&message=${messageBox.value}`, {\r\n      method: 'POST',\r\n      //Idak if the header part is necessary.. i forget what it does when sending the fetch req.\r\n      headers: {\r\n        'Accept': 'application/json',\r\n      },\r\n    });\r\n    //Probably should use body, but words can only be 20 letters long, so I think we're good\r\n\r\n    if(response.status === 204) {\r\n      console.log(\"Message Sent!\")\r\n    } else {\r\n      console.log(response.statusText);\r\n      sendMessageButton.disabled = false;\r\n      messageBox.disabled = false;\r\n      messageBox.placeholder = 'Try again, something went wrong';\r\n      messageBox.value = '';\r\n    }\r\n  }\r\n  sendMessageButton.addEventListener(\"click\", sendMessage)\r\n  messageBox.addEventListener(\"keydown\", (e) => {\r\n    if(e.key === 'Enter') {\r\n      sendMessage();\r\n    }\r\n  })\r\n  messageBox.addEventListener('input', function (e) {\r\n    const inputText = e.target.value;\r\n    const filteredText = inputText.replace(/[^a-zA-Z]/g, '');\r\n  \r\n    if (inputText !== filteredText) {\r\n      e.target.value = filteredText;\r\n    }\r\n  });\r\n\r\n  window.addEventListener(\"beforeunload\", () => {\r\n    if(localData.gameCode && localData.state !== 'home'){\r\n      console.log('quitting');\r\n      fetch(`/quitGame?code=${localData.gameCode}`, {\r\n        method: 'POST',\r\n        headers: {\r\n          'Accept': 'application/json',\r\n        },\r\n      });\r\n    } \r\n    resetLocalData();\r\n  })\r\n}\r\n\r\nwindow.onload = init; \n\n//# sourceURL=webpack://430-project1/./client/client.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./client/client.js"]();
/******/ 	
/******/ })()
;