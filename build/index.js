"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _markua = require("./markua");

var _markua2 = _interopRequireDefault(_markua);

var _web_file_accessor = require("./web_file_accessor");

var _web_file_accessor2 = _interopRequireDefault(_web_file_accessor);

if (typeof window !== "undefined") window.markua = new _markua2["default"]("/data/test_book", { fileAccessor: _web_file_accessor2["default"], debug: true });