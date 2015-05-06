import Lexer from "./lexer";
import Parser from "./parser";
import nativeFileAccessor from "./native_file_accessor"

let ObjectAssign = require("object-assign");
let _ = require("underscore")
let async = require("async")

const DEFAULT_OPTIONS = {
  fileAccessor: nativeFileAccessor,
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
  // Run the markua book generator on a given project path.
  constructor(projectPath, options) {
    this.projectPath = projectPath;
    this.options = ObjectAssign(DEFAULT_OPTIONS, options);
    this.fileAccessor = new this.options.fileAccessor(projectPath);
  }

  run (cb) {
    // First, get all the chapters in the book using book.txt
    async.waterfall([this.loadBook.bind(this), this.loadChapters.bind(this), this.processChapters.bind(this)], (error, result) => {
      if (error) {
        // There was an error, report it
        console.log("Error when generating the markua document. ", error);
        return cb(error)
      }
      cb(error, result);
    });
  }

  loadBook(done) {
    this.fileAccessor.get("book.txt", (error, bookString) => {
      if (error) return done(error);
      let lines = _.compact(bookString.split("\n"));
      done(null, lines);
    });
  }

  loadChapters(chapters, done) {
    async.map(chapters, (chapter, cb) => {
      this.fileAccessor.get(chapter, cb)
    }, done)
  }

  processChapters(chapters, done) {
    async.map(chapters, (chapter, cb) => {
      try {
        let tokens = Lexer.lex(chapter, this.options);
        cb(null, Parser.parse(tokens, this.options));
      } catch (e) {
        cb(e);
      }
    }, (error, results) => {
      // Concat it
      done(null, results.join("\n\n"))
    })
  }
};

export default Markua;
