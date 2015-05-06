"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
var async = require("async");
var _ = require("underscore");

var Combiner = (function () {
  function Combiner(projectPath, options) {
    _classCallCheck(this, Combiner);

    this.fileAccessor = new options.fileAccessor(projectPath);
  }

  _createClass(Combiner, [{
    key: "combine",
    value: function combine(cb) {
      var _this = this;

      // Get the book.txt
      this.fileAccessor.get("book.txt", function (error, bookString) {
        var lines = _.compact(bookString.split("\n"));
        // For every line in the book.txt, try to find a corresponding chapter for
        // it
        async.map(lines, function (line, callback) {
          _this.fileAccessor.get(line, callback);
        }, function (error, result) {
          cb(null, result);
        });
      });
    }
  }]);

  return Combiner;
})();

;

exports["default"] = Combiner;
module.exports = exports["default"];