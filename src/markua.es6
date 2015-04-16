import Lexer from "./lexer"
import Parser from "./parser"

class Markua {
  constructor() {
    this.lexer = new Lexer();
    this.parser = new Parser();

    console.log("Making a new markua instance");
  }

  static run (source, options) {
    console.log(`Running with source ${source} and options ${options}`);
  }
};

export default new Markua();
 
