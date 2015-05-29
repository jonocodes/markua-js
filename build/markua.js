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

var _nativeFileAccessor = require("./native_file_accessor");

var _nativeFileAccessor2 = _interopRequireWildcard(_nativeFileAccessor);

var _webFileAccessor = require("./web_file_accessor");

var _webFileAccessor2 = _interopRequireWildcard(_webFileAccessor);

var ObjectAssign = require("object-assign");
var _ = require("underscore");
var async = require("async");

var DEFAULT_OPTIONS = {
  fileAccessor: _nativeFileAccessor2["default"],
  tables: true,
  breaks: false,
  sanitize: false,
  silent: false,
  highlight: null,
  langPrefix: "lang-",
  headerPrefix: "",
  debug: false,
  bookType: "book"
};

var Markua = (function () {
  // Run the markua book generator on a given project path.

  function Markua(projectPath, options) {
    _classCallCheck(this, Markua);

    this.projectPath = projectPath;
    this.options = ObjectAssign(DEFAULT_OPTIONS, options);
    this.fileAccessor = new this.options.fileAccessor(projectPath);
    this.options.fileAccessor = this.fileAccessor;
  }

  _createClass(Markua, [{
    key: "run",
    value: function run(cb) {
      // First, get all the chapters in the book using book.txt
      async.waterfall([this.determineType.bind(this), this.loadBook.bind(this), this.loadChapters.bind(this), this.processChapters.bind(this)], function (error, result) {
        if (error) {
          // There was an error, report it
          console.log("Error when generating the markua document. ", error);
          return cb(error);
        }
        cb(error, result);
      });
    }
  }, {
    key: "determineType",
    value: function determineType(done) {
      this.fileAccessor.get("book.txt", function (error, bookText) {
        if (/ENOENT/.test(error)) done(null, "single");else done(null, "multi");
      });
    }
  }, {
    key: "loadBook",
    value: function loadBook(projectType, done) {
      if (projectType === "single") {
        // We have just a manuscript.txt file, just process it
        done(null, projectType, []);
      } else {
        this.fileAccessor.get("book.txt", function (error, bookString) {
          if (error) return done(error);
          var lines = _.compact(bookString.split("\n"));
          done(null, projectType, lines);
        });
      }
    }
  }, {
    key: "loadChapters",
    value: function loadChapters(projectType, chapters, done) {
      var _this = this;

      if (projectType === "single") {
        this.fileAccessor.get("manuscript.txt", function (error, contents) {
          if (error) return done(error);
          done(null, [contents]);
        });
      } else {
        async.map(chapters, function (chapter, cb) {
          _this.fileAccessor.get("" + chapter, cb);
        }, done);
      }
    }
  }, {
    key: "processChapters",
    value: function processChapters(chapters, done) {
      var _this2 = this;

      async.map(_.compact(chapters), function (chapter, cb) {
        // try {
        var tokens = _Lexer2["default"].lex(chapter, _this2.options);
        cb(null, _Parser2["default"].parse(tokens, _this2.options));
        // } catch (e) {
        // console.error(e);
        // cb(e);
        // }
      }, function (error, results) {
        // Concat it
        done(null, results.join("\n"));
      });
    }
  }]);

  return Markua;
})();

Markua.WebFileAccessor = _webFileAccessor2["default"];

exports["default"] = Markua;
module.exports = exports["default"];