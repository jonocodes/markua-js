"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _file_accessor = require("./file_accessor");

var _file_accessor2 = _interopRequireDefault(_file_accessor);

var WebFileAccessor = (function (_FileAccessor) {
  _inherits(WebFileAccessor, _FileAccessor);

  function WebFileAccessor() {
    _classCallCheck(this, WebFileAccessor);

    _get(Object.getPrototypeOf(WebFileAccessor.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(WebFileAccessor, [{
    key: "getFilePrefix",
    value: function getFilePrefix(type) {
      if (type === "code") return this.projectPath + "/code";else return this.projectPath;
    }
  }, {
    key: "get",

    // Retrieves a file from our client side data (faked)
    value: function get(filePath, cb) {
      var type = arguments.length <= 2 || arguments[2] === undefined ? "manuscript" : arguments[2];

      var item = window.fileData[this.getFilePrefix(type) + "/" + filePath];
      cb(null, item);
    }
  }, {
    key: "getSync",

    // This is required for the code block imports, maybe do the file retrieval in an async method as a pre
    // or post processing step
    value: function getSync(filePath) {
      var type = arguments.length <= 1 || arguments[1] === undefined ? "manuscript" : arguments[1];

      return window.fileData[this.getFilePrefix(type) + "/" + filePath];
    }
  }]);

  return WebFileAccessor;
})(_file_accessor2["default"]);

exports["default"] = WebFileAccessor;
module.exports = exports["default"];