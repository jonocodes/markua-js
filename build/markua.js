"use strict";
var $__lexer__,
    $__parser__;
var Lexer = ($__lexer__ = require("./lexer"), $__lexer__ && $__lexer__.__esModule && $__lexer__ || {default: $__lexer__}).default;
var Parser = ($__parser__ = require("./parser"), $__parser__ && $__parser__.__esModule && $__parser__ || {default: $__parser__}).default;
var Markua = (function() {
  function Markua() {
    this.lexer = new Lexer();
    this.parser = new Parser();
    console.log("Making a new markua instance");
  }
  return ($traceurRuntime.createClass)(Markua, {}, {run: function(source, options) {
      console.log(("Running with source " + source + " and options " + options));
    }});
}());
;
var $__default = new Markua();
Object.defineProperties(module.exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
