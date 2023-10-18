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

eval("let localData = {}\r\n\r\nconst resetLocalData = () => {\r\n  localData = {\r\n    name: localStorage.getItem('STST_name') || 'guest',\r\n    face: localStorage.getItem('STST_face') || 1,\r\n    //Stats\r\n    state : 'home',\r\n    player : null,\r\n    words : {},\r\n    gameCode : null,\r\n  }\r\n}\r\n\r\nconst handleResponse = async (response) => {\r\n  //Do the do\r\n}\r\n\r\n// const sendFetch = async (url) => {\r\n//   const response = await fetch(url);\r\n//   handleResponse(response);\r\n// };\r\n\r\n\r\n//Updates game list on homepage with data from lookForGames()\r\nconst updateGameList = async (response) => {\r\n  const gameList = document.querySelector(\"#game-list\"); \r\n\r\n  let obj = await response.json();\r\n  if(JSON.stringify(obj) === '{}') return;\r\n  console.log(obj);\r\n  // obj.activeCodes\r\n  //TODO make these into list (scrollable.)\r\n  //Maybe use an html template? \r\n  // after template is built, add event listener to button.\r\n}\r\n\r\n//Long polling on home page\r\nconst lookForGames = async () => {\r\n  let response = await fetch('/lookForGames', {\r\n    method: 'GET',\r\n    headers: {\r\n      'Accept': 'application/json',\r\n    },\r\n  });\r\n  \r\n  if (localData.inGame !== 'home') return\r\n\r\n  if (response.status = 502) {\r\n    await lookForGames();\r\n  } else if (response.status != 200) {\r\n    console.log(response.statusText)\r\n    console.log(\"searching again\")\r\n    // IDK if this is needed??? (below)\r\n    // used on the website I learned about long polling from\r\n    // await new Promise(resolve => setTimeout(resolve, 1000))\r\n    await lookForGames();\r\n  } else {\r\n    updateGameList(response)\r\n    await lookForGames();\r\n  }\r\n}\r\n\r\n\r\n\r\nconst init = async () => {\r\n  resetLocalData();\r\n\r\n  //Populate current open games\r\n  const response = await fetch('/getGameList')\r\n  updateGameList(response)\r\n\r\n  // Set all buttons to send fetch requests\r\n  const newGameButton = document.querySelector(\"#make-new-game\");\r\n  // Functionality\r\n\r\n  const createNewGame = async () => {\r\n    newGameButton.disabled = true;\r\n    const response = await fetch(`/newGame?name=${localData.name}&face=${localData.face}`, {\r\n      method: 'POST',\r\n      headers: {\r\n        'Accept': 'application/json',\r\n      },\r\n    });\r\n    if (response.status === 201) {\r\n      localData.inGame = 'waiting';\r\n      localData.player = 'p1';\r\n      document.querySelector('#home-page').classList.remove('active');\r\n      document.querySelector('#game-page').classList.add('active');\r\n\r\n      let obj = await response.json()\r\n      localData.gameCode = obj.code;\r\n\r\n      //TODO\r\n      // INDICATE  wait for other player.\r\n      \r\n      //Call long poll for /getotherplayer\r\n    } else {\r\n      newGameButton.disabled = false;\r\n      alert('There was an issue making your game. Please try again.')\r\n    }\r\n  }\r\n\r\n  newGameButton.addEventListener(\"click\", createNewGame);\r\n  lookForGames();\r\n}\r\n\r\nwindow.addEventListener(\"beforeunload\", () => {\r\n  // quit game (if in one) -- differentiate here or on server for waiting game or in game.\r\n  // event.returnValue = \"you wanna leave? \" -- use if in game\r\n})\r\n\r\nwindow.onload = init;\n\n//# sourceURL=webpack://430-project1/./client/client.js?");

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