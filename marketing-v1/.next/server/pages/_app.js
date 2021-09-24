/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_query__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react-query */ \"react-query\");\n/* harmony import */ var react_query__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_query__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ \"react-redux\");\n/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_redux__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _react_aria_overlays__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @react-aria/overlays */ \"@react-aria/overlays\");\n/* harmony import */ var _react_aria_overlays__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_react_aria_overlays__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_auth_client__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next-auth/client */ \"next-auth/client\");\n/* harmony import */ var next_auth_client__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_auth_client__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var react_query_hydration__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-query/hydration */ \"react-query/hydration\");\n/* harmony import */ var react_query_hydration__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_query_hydration__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var store__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! store */ \"./store/index.ts\");\n/* harmony import */ var styles_globals_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var styles_globals_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(styles_globals_css__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_7__);\nvar _jsxFileName = \"/Users/anamontiaga/Projects/landgriffon/marketing-v1/pages/_app.tsx\";\n\nfunction ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }\n\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\n\n\n\n\n\n\n\nconst queryClient = new react_query__WEBPACK_IMPORTED_MODULE_0__.QueryClient();\n\nconst MyApp = ({\n  Component,\n  pageProps\n}) => /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxDEV)(react_redux__WEBPACK_IMPORTED_MODULE_1__.Provider, {\n  store: store__WEBPACK_IMPORTED_MODULE_5__.default,\n  children: /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxDEV)(react_query__WEBPACK_IMPORTED_MODULE_0__.QueryClientProvider, {\n    client: queryClient,\n    children: /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxDEV)(react_query_hydration__WEBPACK_IMPORTED_MODULE_4__.Hydrate, {\n      state: pageProps.dehydratedState,\n      children: /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxDEV)(next_auth_client__WEBPACK_IMPORTED_MODULE_3__.Provider, {\n        session: pageProps.session,\n        options: {\n          clientMaxAge: 5 * 60,\n          // Re-fetch session if cache is older than 60 seconds\n          keepAlive: 10 * 60 // Send keepAlive message every 10 minutes\n\n        },\n        children: /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxDEV)(_react_aria_overlays__WEBPACK_IMPORTED_MODULE_2__.OverlayProvider, {\n          children: /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxDEV)(Component, _objectSpread({}, pageProps), void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 28,\n            columnNumber: 13\n          }, undefined)\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 27,\n          columnNumber: 11\n        }, undefined)\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 20,\n        columnNumber: 9\n      }, undefined)\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 19,\n      columnNumber: 7\n    }, undefined)\n  }, void 0, false, {\n    fileName: _jsxFileName,\n    lineNumber: 18,\n    columnNumber: 5\n  }, undefined)\n}, void 0, false, {\n  fileName: _jsxFileName,\n  lineNumber: 17,\n  columnNumber: 3\n}, undefined);\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLnRzeC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBRUE7QUFFQTs7QUFFQSxNQUFNUSxXQUFXLEdBQUcsSUFBSVIsb0RBQUosRUFBcEI7O0FBRUEsTUFBTVMsS0FBeUIsR0FBRyxDQUFDO0FBQUVDLEVBQUFBLFNBQUY7QUFBYUMsRUFBQUE7QUFBYixDQUFELGtCQUNoQyw4REFBQyxpREFBRDtBQUFlLE9BQUssRUFBRUosMENBQXRCO0FBQUEseUJBQ0UsOERBQUMsNERBQUQ7QUFBcUIsVUFBTSxFQUFFQyxXQUE3QjtBQUFBLDJCQUNFLDhEQUFDLDBEQUFEO0FBQVMsV0FBSyxFQUFFRyxTQUFTLENBQUNDLGVBQTFCO0FBQUEsNkJBQ0UsOERBQUMsc0RBQUQ7QUFDRSxlQUFPLEVBQUVELFNBQVMsQ0FBQ0UsT0FEckI7QUFFRSxlQUFPLEVBQUU7QUFDUEMsVUFBQUEsWUFBWSxFQUFFLElBQUksRUFEWDtBQUNlO0FBQ3RCQyxVQUFBQSxTQUFTLEVBQUUsS0FBSyxFQUZULENBRWE7O0FBRmIsU0FGWDtBQUFBLCtCQU9FLDhEQUFDLGlFQUFEO0FBQUEsaUNBQ0UsOERBQUMsU0FBRCxvQkFBZUosU0FBZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBREY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVBGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFERjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBREY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQURGO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFERjs7QUFvQkEsaUVBQWVGLEtBQWYiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9sYW5kZ3JpZmZvbi1tYXJrZXRpbmctdjEvLi9wYWdlcy9fYXBwLnRzeD83MjE2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFF1ZXJ5Q2xpZW50LCBRdWVyeUNsaWVudFByb3ZpZGVyIH0gZnJvbSAncmVhY3QtcXVlcnknO1xuaW1wb3J0IHsgUHJvdmlkZXIgYXMgUmVkdXhQcm92aWRlciB9IGZyb20gJ3JlYWN0LXJlZHV4JztcblxuaW1wb3J0IHR5cGUgeyBBcHBQcm9wcyB9IGZyb20gJ25leHQvYXBwJztcblxuaW1wb3J0IHsgT3ZlcmxheVByb3ZpZGVyIH0gZnJvbSAnQHJlYWN0LWFyaWEvb3ZlcmxheXMnO1xuaW1wb3J0IHsgUHJvdmlkZXIgYXMgQXV0aGVudGljYXRpb25Qcm92aWRlciB9IGZyb20gJ25leHQtYXV0aC9jbGllbnQnO1xuaW1wb3J0IHsgSHlkcmF0ZSB9IGZyb20gJ3JlYWN0LXF1ZXJ5L2h5ZHJhdGlvbic7XG5cbmltcG9ydCBzdG9yZSBmcm9tICdzdG9yZSc7XG5cbmltcG9ydCAnc3R5bGVzL2dsb2JhbHMuY3NzJztcblxuY29uc3QgcXVlcnlDbGllbnQgPSBuZXcgUXVlcnlDbGllbnQoKTtcblxuY29uc3QgTXlBcHA6IFJlYWN0LkZDPEFwcFByb3BzPiA9ICh7IENvbXBvbmVudCwgcGFnZVByb3BzIH06IEFwcFByb3BzKSA9PiAoXG4gIDxSZWR1eFByb3ZpZGVyIHN0b3JlPXtzdG9yZX0+XG4gICAgPFF1ZXJ5Q2xpZW50UHJvdmlkZXIgY2xpZW50PXtxdWVyeUNsaWVudH0+XG4gICAgICA8SHlkcmF0ZSBzdGF0ZT17cGFnZVByb3BzLmRlaHlkcmF0ZWRTdGF0ZX0+XG4gICAgICAgIDxBdXRoZW50aWNhdGlvblByb3ZpZGVyXG4gICAgICAgICAgc2Vzc2lvbj17cGFnZVByb3BzLnNlc3Npb259XG4gICAgICAgICAgb3B0aW9ucz17e1xuICAgICAgICAgICAgY2xpZW50TWF4QWdlOiA1ICogNjAsIC8vIFJlLWZldGNoIHNlc3Npb24gaWYgY2FjaGUgaXMgb2xkZXIgdGhhbiA2MCBzZWNvbmRzXG4gICAgICAgICAgICBrZWVwQWxpdmU6IDEwICogNjAsIC8vIFNlbmQga2VlcEFsaXZlIG1lc3NhZ2UgZXZlcnkgMTAgbWludXRlc1xuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8T3ZlcmxheVByb3ZpZGVyPlxuICAgICAgICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxuICAgICAgICAgIDwvT3ZlcmxheVByb3ZpZGVyPlxuICAgICAgICA8L0F1dGhlbnRpY2F0aW9uUHJvdmlkZXI+XG4gICAgICA8L0h5ZHJhdGU+XG4gICAgPC9RdWVyeUNsaWVudFByb3ZpZGVyPlxuICA8L1JlZHV4UHJvdmlkZXI+XG4pO1xuXG5leHBvcnQgZGVmYXVsdCBNeUFwcDtcbiJdLCJuYW1lcyI6WyJRdWVyeUNsaWVudCIsIlF1ZXJ5Q2xpZW50UHJvdmlkZXIiLCJQcm92aWRlciIsIlJlZHV4UHJvdmlkZXIiLCJPdmVybGF5UHJvdmlkZXIiLCJBdXRoZW50aWNhdGlvblByb3ZpZGVyIiwiSHlkcmF0ZSIsInN0b3JlIiwicXVlcnlDbGllbnQiLCJNeUFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsImRlaHlkcmF0ZWRTdGF0ZSIsInNlc3Npb24iLCJjbGllbnRNYXhBZ2UiLCJrZWVwQWxpdmUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./store/features/ui/slice.ts":
/*!************************************!*\
  !*** ./store/features/ui/slice.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"applicationSlice\": () => (/* binding */ applicationSlice),\n/* harmony export */   \"setMenuMobileOpen\": () => (/* binding */ setMenuMobileOpen),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @reduxjs/toolkit */ \"@reduxjs/toolkit\");\n/* harmony import */ var _reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__);\nfunction ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }\n\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n // Define a type for the slice state\n\n// Define the initial state using that type\nconst initialState = {\n  isMenuMobileOpen: false\n};\nconst applicationSlice = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__.createSlice)({\n  name: 'application',\n  initialState,\n  reducers: {\n    setMenuMobileOpen: (state, action) => _objectSpread(_objectSpread({}, state), {}, {\n      isMenuMobileOpen: action.payload\n    })\n  }\n});\nconst {\n  setMenuMobileOpen\n} = applicationSlice.actions;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (applicationSlice.reducer);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zdG9yZS9mZWF0dXJlcy91aS9zbGljZS50cy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztDQUVBOztBQUtBO0FBQ0EsTUFBTUMsWUFBcUIsR0FBRztBQUM1QkMsRUFBQUEsZ0JBQWdCLEVBQUU7QUFEVSxDQUE5QjtBQUlPLE1BQU1DLGdCQUFnQixHQUFHSCw2REFBVyxDQUFDO0FBQzFDSSxFQUFBQSxJQUFJLEVBQUUsYUFEb0M7QUFFMUNILEVBQUFBLFlBRjBDO0FBRzFDSSxFQUFBQSxRQUFRLEVBQUU7QUFDUkMsSUFBQUEsaUJBQWlCLEVBQUUsQ0FBQ0MsS0FBRCxFQUFRQyxNQUFSLHFDQUNkRCxLQURjO0FBRWpCTCxNQUFBQSxnQkFBZ0IsRUFBRU0sTUFBTSxDQUFDQztBQUZSO0FBRFg7QUFIZ0MsQ0FBRCxDQUFwQztBQVdBLE1BQU07QUFBRUgsRUFBQUE7QUFBRixJQUF3QkgsZ0JBQWdCLENBQUNPLE9BQS9DO0FBRVAsaUVBQWVQLGdCQUFnQixDQUFDUSxPQUFoQyIsInNvdXJjZXMiOlsid2VicGFjazovL2xhbmRncmlmZm9uLW1hcmtldGluZy12MS8uL3N0b3JlL2ZlYXR1cmVzL3VpL3NsaWNlLnRzPzQ2YzciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlU2xpY2UsIFBheWxvYWRBY3Rpb24gfSBmcm9tICdAcmVkdXhqcy90b29sa2l0JztcblxuLy8gRGVmaW5lIGEgdHlwZSBmb3IgdGhlIHNsaWNlIHN0YXRlXG5pbnRlcmZhY2UgVUlTdGF0ZSB7XG4gIGlzTWVudU1vYmlsZU9wZW46IGJvb2xlYW47XG59XG5cbi8vIERlZmluZSB0aGUgaW5pdGlhbCBzdGF0ZSB1c2luZyB0aGF0IHR5cGVcbmNvbnN0IGluaXRpYWxTdGF0ZTogVUlTdGF0ZSA9IHtcbiAgaXNNZW51TW9iaWxlT3BlbjogZmFsc2UsXG59O1xuXG5leHBvcnQgY29uc3QgYXBwbGljYXRpb25TbGljZSA9IGNyZWF0ZVNsaWNlKHtcbiAgbmFtZTogJ2FwcGxpY2F0aW9uJyxcbiAgaW5pdGlhbFN0YXRlLFxuICByZWR1Y2Vyczoge1xuICAgIHNldE1lbnVNb2JpbGVPcGVuOiAoc3RhdGUsIGFjdGlvbjogUGF5bG9hZEFjdGlvbjxib29sZWFuPikgPT4gKHtcbiAgICAgIC4uLnN0YXRlLFxuICAgICAgaXNNZW51TW9iaWxlT3BlbjogYWN0aW9uLnBheWxvYWQsXG4gICAgfSksXG4gIH0sXG59KTtcblxuZXhwb3J0IGNvbnN0IHsgc2V0TWVudU1vYmlsZU9wZW4gfSA9IGFwcGxpY2F0aW9uU2xpY2UuYWN0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgYXBwbGljYXRpb25TbGljZS5yZWR1Y2VyO1xuIl0sIm5hbWVzIjpbImNyZWF0ZVNsaWNlIiwiaW5pdGlhbFN0YXRlIiwiaXNNZW51TW9iaWxlT3BlbiIsImFwcGxpY2F0aW9uU2xpY2UiLCJuYW1lIiwicmVkdWNlcnMiLCJzZXRNZW51TW9iaWxlT3BlbiIsInN0YXRlIiwiYWN0aW9uIiwicGF5bG9hZCIsImFjdGlvbnMiLCJyZWR1Y2VyIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./store/features/ui/slice.ts\n");

/***/ }),

/***/ "./store/index.ts":
/*!************************!*\
  !*** ./store/index.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var store_features_ui_slice__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! store/features/ui/slice */ \"./store/features/ui/slice.ts\");\n/* harmony import */ var _reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @reduxjs/toolkit */ \"@reduxjs/toolkit\");\n/* harmony import */ var _reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_1__);\nfunction ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }\n\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\n\nconst staticReducers = {\n  ui: store_features_ui_slice__WEBPACK_IMPORTED_MODULE_0__.default\n};\nconst asyncReducers = {};\n\nconst createReducer = reducers => (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_1__.combineReducers)(_objectSpread(_objectSpread({}, staticReducers), reducers));\n\nconst store = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_1__.configureStore)({\n  reducer: createReducer(asyncReducers),\n  devTools: true\n}); // Infer the `RootState` and `AppDispatch` types from the store itself\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (store);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zdG9yZS9pbmRleC50cy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7QUFFQTtBQUdBLE1BQU1HLGNBQWMsR0FBRztBQUNyQkgsRUFBQUEsRUFBRUEsOERBQUFBO0FBRG1CLENBQXZCO0FBSUEsTUFBTUksYUFBYSxHQUFHLEVBQXRCOztBQUVBLE1BQU1DLGFBQWEsR0FBSUMsUUFBRCxJQUNwQkosaUVBQWUsaUNBQ1ZDLGNBRFUsR0FFVkcsUUFGVSxFQURqQjs7QUFNQSxNQUFNQyxLQUFLLEdBQUdOLGdFQUFjLENBQUM7QUFDM0JPLEVBQUFBLE9BQU8sRUFBRUgsYUFBYSxDQUFDRCxhQUFELENBREs7QUFFM0JLLEVBQUFBLFFBQVE7QUFGbUIsQ0FBRCxDQUE1QixFQUtBOztBQU1BLGlFQUFlRixLQUFmIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbGFuZGdyaWZmb24tbWFya2V0aW5nLXYxLy4vc3RvcmUvaW5kZXgudHM/NTk4YSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdWkgZnJvbSAnc3RvcmUvZmVhdHVyZXMvdWkvc2xpY2UnO1xuXG5pbXBvcnQgeyBjb25maWd1cmVTdG9yZSwgY29tYmluZVJlZHVjZXJzIH0gZnJvbSAnQHJlZHV4anMvdG9vbGtpdCc7XG5pbXBvcnQgdHlwZSB7IFJlZHVjZXJzTWFwT2JqZWN0IH0gZnJvbSAnQHJlZHV4anMvdG9vbGtpdCc7XG5cbmNvbnN0IHN0YXRpY1JlZHVjZXJzID0ge1xuICB1aSxcbn07XG5cbmNvbnN0IGFzeW5jUmVkdWNlcnMgPSB7fTtcblxuY29uc3QgY3JlYXRlUmVkdWNlciA9IChyZWR1Y2VyczogUmVkdWNlcnNNYXBPYmplY3QpID0+XG4gIGNvbWJpbmVSZWR1Y2Vycyh7XG4gICAgLi4uc3RhdGljUmVkdWNlcnMsXG4gICAgLi4ucmVkdWNlcnMsXG4gIH0pO1xuXG5jb25zdCBzdG9yZSA9IGNvbmZpZ3VyZVN0b3JlKHtcbiAgcmVkdWNlcjogY3JlYXRlUmVkdWNlcihhc3luY1JlZHVjZXJzKSxcbiAgZGV2VG9vbHM6IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicsXG59KTtcblxuLy8gSW5mZXIgdGhlIGBSb290U3RhdGVgIGFuZCBgQXBwRGlzcGF0Y2hgIHR5cGVzIGZyb20gdGhlIHN0b3JlIGl0c2VsZlxuZXhwb3J0IHR5cGUgUm9vdFN0YXRlID0gUmV0dXJuVHlwZTx0eXBlb2Ygc3RvcmUuZ2V0U3RhdGU+O1xuXG4vLyBJbmZlcnJlZCB0eXBlOiB7cG9zdHM6IFBvc3RzU3RhdGUsIGNvbW1lbnRzOiBDb21tZW50c1N0YXRlLCB1c2VyczogVXNlcnNTdGF0ZX1cbmV4cG9ydCB0eXBlIEFwcERpc3BhdGNoID0gdHlwZW9mIHN0b3JlLmRpc3BhdGNoO1xuXG5leHBvcnQgZGVmYXVsdCBzdG9yZTtcbiJdLCJuYW1lcyI6WyJ1aSIsImNvbmZpZ3VyZVN0b3JlIiwiY29tYmluZVJlZHVjZXJzIiwic3RhdGljUmVkdWNlcnMiLCJhc3luY1JlZHVjZXJzIiwiY3JlYXRlUmVkdWNlciIsInJlZHVjZXJzIiwic3RvcmUiLCJyZWR1Y2VyIiwiZGV2VG9vbHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./store/index.ts\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "@react-aria/overlays":
/*!***************************************!*\
  !*** external "@react-aria/overlays" ***!
  \***************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@react-aria/overlays");

/***/ }),

/***/ "@reduxjs/toolkit":
/*!***********************************!*\
  !*** external "@reduxjs/toolkit" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@reduxjs/toolkit");

/***/ }),

/***/ "next-auth/client":
/*!***********************************!*\
  !*** external "next-auth/client" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("next-auth/client");

/***/ }),

/***/ "react-query":
/*!******************************!*\
  !*** external "react-query" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-query");

/***/ }),

/***/ "react-query/hydration":
/*!****************************************!*\
  !*** external "react-query/hydration" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-query/hydration");

/***/ }),

/***/ "react-redux":
/*!******************************!*\
  !*** external "react-redux" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-redux");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/_app.tsx"));
module.exports = __webpack_exports__;

})();