import Lexer from "./lexer";
import Parser from "./parser";

let ObjectAssign = require("object-assign");

const DEFAULT_OPTIONS = {
  tables: true,
  breaks: false,
  sanitize: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  headerPrefix: '',
  debug: true
}

class Markua {
  static run (source, options) {
    options = ObjectAssign(DEFAULT_OPTIONS, options);

    // TODO @bradens highlighting
    try {
      let tokens = Lexer.lex(source, options);
      return Parser.parse(tokens, options);
    } catch (e) {
      console.log(e);
      return e;
    }
  }
};

export default Markua;
