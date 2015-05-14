"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _Markua = require("./markua");

var _Markua2 = _interopRequireWildcard(_Markua);

var _WebFileAccessor = require("./web_file_accessor");

var _WebFileAccessor2 = _interopRequireWildcard(_WebFileAccessor);

if (typeof window !== "undefined") window.markua = new _Markua2["default"]("/data/test_book", { fileAccessor: _WebFileAccessor2["default"], debug: true });