"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _FileAccessor2 = require("./file_accessor");

var _FileAccessor3 = _interopRequireWildcard(_FileAccessor2);

var fs,
    path = require("path");

try {
  fs = require("fs");
} catch (err) {
  console.log("fs is not available in this env");
}

var NativeFileAccessor = (function (_FileAccessor) {
  function NativeFileAccessor() {
    _classCallCheck(this, NativeFileAccessor);

    if (_FileAccessor != null) {
      _FileAccessor.apply(this, arguments);
    }
  }

  _inherits(NativeFileAccessor, _FileAccessor);

  _createClass(NativeFileAccessor, [{
    key: "get",

    // Override
    value: function get(filePath, cb) {
      fs.readFile(path.join(this.projectPath, filePath), { encoding: "utf8" }, function (error, contents) {
        if (error) return cb(error);
        cb(null, contents);
      });
    }
  }, {
    key: "getSync",

    // This is required for the code block imports, maybe do the file retrieval in an async method as a pre
    // or post processing step
    value: function getSync(filePath) {
      return fs.readFileSync(path.join(this.projectPath, filePath), { encoding: "utf8" }).toString();
    }
  }]);

  return NativeFileAccessor;
})(_FileAccessor3["default"]);

exports["default"] = NativeFileAccessor;
module.exports = exports["default"];