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
  debug: false,
  bookType: "book"
};

class Markua {
  // Run the markua book generator on a given project path.
  constructor(projectPath, options) {
    this.projectPath = projectPath;
    this.options = ObjectAssign(DEFAULT_OPTIONS, options);
    this.fileAccessor = new this.options.fileAccessor(projectPath);
  }

  run (cb) {
    // First, get all the chapters in the book using book.txt
    async.waterfall([this.determineType.bind(this), this.loadBook.bind(this), this.loadChapters.bind(this), this.processChapters.bind(this)], (error, result) => {
      if (error) {
        // There was an error, report it
        console.log("Error when generating the markua document. ", error);
        return cb(error);
      }
      cb(error, result);
    });
  }

  determineType(done) {
    this.fileAccessor.get('book.txt', (error, bookText) => {
      if (/ENOENT/.test(error))
        done(null, 'single');
      else
        done(null, 'multi');
    });
  }

  loadBook(projectType, done) {
    if (projectType === 'single') {
      // We have just a manuscript.txt file, just process it
      done(null, projectType, []);
    }
    else {
      this.fileAccessor.get("book.txt", (error, bookString) => {
        if (error) return done(error);
        let lines = _.compact(bookString.split("\n"));
        done(null, projectType, lines);
      });
    }
  }

  loadChapters(projectType, chapters, done) {
    if (projectType === 'single') {
      this.fileAccessor.get('manuscript.txt', (error, contents) => {
        if (error) return done(error);
        done(null, [contents]);
      });
    }
    else {
      async.map(chapters, (chapter, cb) => {
        this.fileAccessor.get(`manuscript/${chapter}`, cb);
      }, done);
    }
  }

  processChapters(chapters, done) {
    async.map(_.compact(chapters), (chapter, cb) => {
      // try {
      let tokens = Lexer.lex(chapter, this.options);
      cb(null, Parser.parse(tokens, this.options));
      // } catch (e) {
        // console.error(e);
        // cb(e);
      // }
    }, (error, results) => {
      // Concat it
      done(null, results.join("\n"));
    });
  }
}

export default Markua;
