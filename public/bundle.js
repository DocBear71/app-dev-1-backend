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

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ (() => {

eval("var todoForm = document.getElementById('new-todo-form');\ntodoForm.addEventListener('submit', function (event) {\n  event.preventDefault();\n  var newToDo = event.target.firstElementChild.value;\n  var toDo;\n  if (newToDo !== '') {\n    toDo = {\n      title: newToDo\n    };\n    fetch('https://eds-nodejs25.vercel.app/api/todos', {\n      method: 'POST',\n      body: JSON.stringify(toDo),\n      headers: {\n        'Content-Type': 'application/json; charset=UTF-8'\n      }\n    }).then(function (res) {\n      return console.log(res.json());\n    });\n  }\n});\n\n//# sourceURL=webpack://client/./src/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/index.js"]();
/******/ 	
/******/ })()
;