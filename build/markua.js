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

var ObjectAssign = require("object-assign");

var DEFAULT_OPTIONS = {
  tables: true,
  breaks: false,
  sanitize: false,
  silent: false,
  highlight: null,
  langPrefix: "lang-",
  headerPrefix: "",
  debug: true
};

var Markua = (function () {
  function Markua() {
    _classCallCheck(this, Markua);
  }

  _createClass(Markua, null, [{
    key: "run",
    value: function run(source, options) {
      options = ObjectAssign(DEFAULT_OPTIONS, options);

      // TODO @bradens highlighting
      try {
        var tokens = _Lexer2["default"].lex(source, options);
        return _Parser2["default"].parse(tokens, options);
      } catch (e) {
        console.log(e);
        return e;
      }
    }
  }]);

  return Markua;
})();

;

exports["default"] = Markua;
module.exports = exports["default"];