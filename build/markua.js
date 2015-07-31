"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _lexer = require("./lexer");

var _lexer2 = _interopRequireDefault(_lexer);

var _parser = require("./parser");

var _parser2 = _interopRequireDefault(_parser);

var _native_file_accessor = require("./native_file_accessor");

var _native_file_accessor2 = _interopRequireDefault(_native_file_accessor);

var _web_file_accessor = require("./web_file_accessor");

var _web_file_accessor2 = _interopRequireDefault(_web_file_accessor);

var ObjectAssign = require("object-assign");
var _ = require("underscore");
_.string = require("underscore.string");
var async = require("async");

var DEFAULT_OPTIONS = {
  fileAccessor: _native_file_accessor2["default"],
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
    if (projectPath === undefined) projectPath = null;

    _classCallCheck(this, Markua);

    this.projectPath = projectPath;
    this.options = ObjectAssign(DEFAULT_OPTIONS, options);
    this.options.projectPath = projectPath;
    this.fileAccessor = new this.options.fileAccessor(projectPath);
    this.options.fileAccessor = this.fileAccessor;
  }

  _createClass(Markua, [{
    key: "runSource",
    value: function runSource(source, cb) {
      var runOptions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      this.options = _.extend(this.options, runOptions);
      this.processChapters([source], cb);
    }
  }, {
    key: "run",
    value: function run(cb) {
      var runOptions = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.options = _.extend(this.options, runOptions);

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
      }, null);
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
        }, null);
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
        }, null);
      } else {
        async.map(chapters, function (chapter, cb) {
          _this.fileAccessor.get(chapter, function (error, contents) {
            // If we are given a cursor position, then insert that into the markua text
            // TODO: This will not work until inline attributes are done.
            if (_this.options.cursor && _this.options.cursor.filename === chapter) {
              contents = _.string.splice(contents, _this.options.cursor.position + 1, 0, "{ data-markua-cursor-position: __markuaCursorPosition__ }");
            }
            cb(null, contents);
          });
        }, done);
      }
    }
  }, {
    key: "processChapters",
    value: function processChapters(chapters, done) {
      var _this2 = this;

      async.map(_.compact(chapters), function (chapter, cb) {
        try {
          var tokens = _lexer2["default"].lex(chapter, _this2.options);
          cb(null, _parser2["default"].parse(tokens, _this2.options));
        } catch (e) {
          console.error(e);
          cb(e);
        }
      }, function (error, results) {
        // Concat it
        done(null, results.join("\n"));
      });
    }
  }]);

  return Markua;
})();

Markua.WebFileAccessor = _web_file_accessor2["default"];

exports["default"] = Markua;
module.exports = exports["default"];