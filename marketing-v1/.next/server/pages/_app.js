"use strict";
(() => {
var exports = {};
exports.id = 888;
exports.ids = [888];
exports.modules = {

/***/ 434:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ _app)
});

;// CONCATENATED MODULE: external "react-query"
const external_react_query_namespaceObject = require("react-query");
;// CONCATENATED MODULE: external "react-redux"
const external_react_redux_namespaceObject = require("react-redux");
;// CONCATENATED MODULE: external "@react-aria/overlays"
const overlays_namespaceObject = require("@react-aria/overlays");
;// CONCATENATED MODULE: external "next-auth/client"
const client_namespaceObject = require("next-auth/client");
;// CONCATENATED MODULE: external "react-query/hydration"
const hydration_namespaceObject = require("react-query/hydration");
;// CONCATENATED MODULE: external "@reduxjs/toolkit"
const toolkit_namespaceObject = require("@reduxjs/toolkit");
;// CONCATENATED MODULE: ./store/features/ui/slice.ts
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

 // Define a type for the slice state

// Define the initial state using that type
const initialState = {
  isMenuMobileOpen: false
};
const applicationSlice = (0,toolkit_namespaceObject.createSlice)({
  name: 'application',
  initialState,
  reducers: {
    setMenuMobileOpen: (state, action) => _objectSpread(_objectSpread({}, state), {}, {
      isMenuMobileOpen: action.payload
    })
  }
});
const {
  setMenuMobileOpen
} = applicationSlice.actions;
/* harmony default export */ const slice = (applicationSlice.reducer);
;// CONCATENATED MODULE: ./store/index.ts
function store_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function store_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { store_ownKeys(Object(source), true).forEach(function (key) { store_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { store_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function store_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



const staticReducers = {
  ui: slice
};
const asyncReducers = {};

const createReducer = reducers => (0,toolkit_namespaceObject.combineReducers)(store_objectSpread(store_objectSpread({}, staticReducers), reducers));

const store = (0,toolkit_namespaceObject.configureStore)({
  reducer: createReducer(asyncReducers),
  devTools: false
}); // Infer the `RootState` and `AppDispatch` types from the store itself

/* harmony default export */ const store_0 = (store);
// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(282);
;// CONCATENATED MODULE: ./pages/_app.tsx
function _app_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _app_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { _app_ownKeys(Object(source), true).forEach(function (key) { _app_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { _app_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _app_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }









const queryClient = new external_react_query_namespaceObject.QueryClient();

const MyApp = ({
  Component,
  pageProps
}) => /*#__PURE__*/jsx_runtime_.jsx(external_react_redux_namespaceObject.Provider, {
  store: store_0,
  children: /*#__PURE__*/jsx_runtime_.jsx(external_react_query_namespaceObject.QueryClientProvider, {
    client: queryClient,
    children: /*#__PURE__*/jsx_runtime_.jsx(hydration_namespaceObject.Hydrate, {
      state: pageProps.dehydratedState,
      children: /*#__PURE__*/jsx_runtime_.jsx(client_namespaceObject.Provider, {
        session: pageProps.session,
        options: {
          clientMaxAge: 5 * 60,
          // Re-fetch session if cache is older than 60 seconds
          keepAlive: 10 * 60 // Send keepAlive message every 10 minutes

        },
        children: /*#__PURE__*/jsx_runtime_.jsx(overlays_namespaceObject.OverlayProvider, {
          children: /*#__PURE__*/jsx_runtime_.jsx(Component, _app_objectSpread({}, pageProps))
        })
      })
    })
  })
});

/* harmony default export */ const _app = (MyApp);

/***/ }),

/***/ 282:
/***/ ((module) => {

module.exports = require("react/jsx-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(434));
module.exports = __webpack_exports__;

})();