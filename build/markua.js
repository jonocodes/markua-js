"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Lexer = require("./lexer");

var _Lexer2 = _interopRequireWildcard(_Lexer);

var _Parser = require("./parser");

var _Parser2 = _interopRequireWildcard(_Parser);

var Markua = (function () {
  function Markua() {
    _classCallCheck(this, Markua);

    this.lexer = new _Lexer2["default"]();
    this.parser = new _Parser2["default"]();

    console.log("Making a new markua instance");
  }

  _createClass(Markua, null, [{
    key: "run",
    value: function run(source, options) {
      console.log("Running with source " + source + " and options " + options);
    }
  }]);

  return Markua;
})();

;

exports["default"] = new Markua();
module.exports = exports["default"];