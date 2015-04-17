"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _block = require("./constants");

// Class for lexing block elements of markua

var Lexer = function Lexer() {
  _classCallCheck(this, Lexer);

  console.log("Making a new lexer....");
  console.log("Got block ", _block.block);
};

;

exports["default"] = Lexer;
module.exports = exports["default"];