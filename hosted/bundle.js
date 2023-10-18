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

eval("const localData = {\r\n  inGame : false,\r\n  player : null,\r\n  \r\n}\r\n\r\nconst handleResponse = async (response) => {\r\n  //Do the do\r\n}\r\n\r\n// const sendFetch = async (url) => {\r\n//   const response = await fetch(url);\r\n//   handleResponse(response);\r\n// };\r\n\r\n\r\n//Updates game list on homepage with data from lookForGames()\r\nconst updateGameList = () => {\r\n\r\n}\r\n\r\n//Long polling on home page\r\nconst lookForGames = async () => {\r\n  let response = await fetch('/lookForGames', {\r\n    method: 'GET',\r\n    headers: {\r\n      'Accept': 'application/json',\r\n    },\r\n  });\r\n  \r\n  if (localData.inGame) return\r\n\r\n  if (response.status = 502) {\r\n    await lookForGames();\r\n  } else if (response.status != 200) {\r\n    console.log(response.statusText)\r\n    // IDK if this is needed???\r\n    // used on the website I learned about long polling from\r\n    // await new Promise(resolve => setTimeout(resolve, 1000))\r\n    await lookForGames();\r\n  } else {\r\n    // TODO!!\r\n    // update game list with response data\r\n    await lookForGames();\r\n  }\r\n}\r\n\r\nconst init = () => {\r\n  // Set all buttons to send fetch requests\r\n  const newGameButton = document.querySelector(\"#make-new-game\");\r\n\r\n  // Functionality\r\n\r\n  const createNewGame = async () => {\r\n    newGameButton.disabled = true;\r\n    const response = await fetch('/newGame', {\r\n      method: 'POST',\r\n      headers: {\r\n        'Accept': 'application/json',\r\n      },\r\n    });\r\n    if (response.status === 201) {\r\n\r\n    } else {\r\n      newGameButton.disabled = false;\r\n      alert('There was an issue making your game. Please try again.')\r\n    }\r\n  }\r\n\r\n  newGameButton.addEventListener(\"click\", createNewGame);\r\n}\r\n\r\nwindow.onload = init;\n\n//# sourceURL=webpack://430-project1/./client/client.js?");

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