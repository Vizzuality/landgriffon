exports.id = 723;
exports.ids = [723];
exports.modules = {

/***/ 914:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* reexport */ component)
});

// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(297);
// EXTERNAL MODULE: external "classnames"
var external_classnames_ = __webpack_require__(58);
var external_classnames_default = /*#__PURE__*/__webpack_require__.n(external_classnames_);
// EXTERNAL MODULE: ./node_modules/next/link.js
var next_link = __webpack_require__(664);
// EXTERNAL MODULE: ./containers/wrapper/index.ts + 1 modules
var wrapper = __webpack_require__(12);
// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(282);
;// CONCATENATED MODULE: ./containers/header/component.tsx






const Header = () => /*#__PURE__*/jsx_runtime_.jsx("header", {
  className: external_classnames_default()({
    'w-full row-auto': true
  }),
  children: /*#__PURE__*/jsx_runtime_.jsx(wrapper/* default */.Z, {
    children: /*#__PURE__*/(0,jsx_runtime_.jsxs)("nav", {
      className: "relative flex flex-wrap items-center justify-between mt-10 md:mt-0 navbar-expand-lg",
      children: [/*#__PURE__*/jsx_runtime_.jsx(next_link.default, {
        href: "/",
        children: "LANDGRIFFON"
      }), /*#__PURE__*/jsx_runtime_.jsx(next_link.default, {
        href: "/about-us",
        children: "About Us"
      })]
    })
  })
});
/* harmony default export */ const component = (Header);
;// CONCATENATED MODULE: ./containers/header/index.ts


/***/ }),

/***/ 12:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* reexport */ component)
});

// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(297);
// EXTERNAL MODULE: external "classnames"
var external_classnames_ = __webpack_require__(58);
var external_classnames_default = /*#__PURE__*/__webpack_require__.n(external_classnames_);
// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(282);
;// CONCATENATED MODULE: ./containers/wrapper/component.tsx



const Wrapper = ({
  children
}) => /*#__PURE__*/jsx_runtime_.jsx("div", {
  className: external_classnames_default()({
    'md:container mx-auto px-10 w-full h-full flex flex-col flex-grow': true
  }),
  children: children
});
/* harmony default export */ const component = (Wrapper);
;// CONCATENATED MODULE: ./containers/wrapper/index.ts


/***/ }),

/***/ 431:
/***/ (() => {

/* (ignored) */

/***/ })

};
;