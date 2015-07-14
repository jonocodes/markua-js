"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _file_accessor = require("./file_accessor");

var _file_accessor2 = _interopRequireDefault(_file_accessor);

var fs,
    path = require("path");

try {
  fs = require("fs");
} catch (err) {
  console.log("fs is not available in this env");
}

var NativeFileAccessor = (function (_FileAccessor) {
  _inherits(NativeFileAccessor, _FileAccessor);

  function NativeFileAccessor() {
    _classCallCheck(this, NativeFileAccessor);

    _get(Object.getPrototypeOf(NativeFileAccessor.prototype), "constructor", this).apply(this, arguments);
  }

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
})(_file_accessor2["default"]);

exports["default"] = NativeFileAccessor;
module.exports = exports["default"];