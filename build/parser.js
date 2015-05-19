"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Renderer = require("./renderer");

var _Renderer2 = _interopRequireWildcard(_Renderer);

var _InlineLexer = require("./inline_lexer");

var _InlineLexer2 = _interopRequireWildcard(_InlineLexer);

var _ = require("underscore");

var Parser = (function () {
  function Parser() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Parser);

    this.options = options;
    this.tokens = [];
    this.token = null;
    this.renderer = new _Renderer2["default"]();
    this.renderer.options = this.options;
  }

  _createClass(Parser, [{
    key: "parse",

    // Parse all the tokens
    value: function parse(src) {
      this.inline = new _InlineLexer2["default"](src.links, this.options);
      this.tokens = src.reverse();

      var out = "";
      while (this.next()) {
        out += this.tok();
      }
      return out;
    }
  }, {
    key: "next",

    // Next Token
    value: function next() {
      return this.token = this.tokens.pop();
    }
  }, {
    key: "peek",

    // Preview Next Token
    value: function peek() {
      return this.tokens[this.tokens.length - 1] || 0;
    }
  }, {
    key: "parseText",

    // Parse Text Tokens
    value: function parseText() {
      var body = this.token.text;

      while (this.peek().type === "text") {
        body += "\n" + this.next().text;
      }

      return this.inline.output(body);
    }
  }, {
    key: "tok",

    // Parse Current Token
    value: function tok() {
      switch (this.token.type) {
        case "space":
          {
            return "";
          }
        case "hr":
          {
            return this.renderer.hr();
          }
        case "heading":
          {
            return this.renderer.heading(this.inline.output(this.token.text), this.token.depth, this.token.text);
          }
        case "code":
          {
            return this.renderer.code(this.token.text, this.token.lang, this.token.escaped);
          }
        case "attribute":
          {
            // Set the attributes for the next tag
            this.attributes = _.object(_.pluck(this.token.attributes, "key"), _.pluck(this.token.attributes, "value"));
            return "";
          }
        case "figure":
          {
            return this.renderer.figure(this.token.alt, this.token.image, this.token.caption, this.attributes);
          }
        case "table":
          {
            var header = "",
                body = "",
                i,
                row,
                cell,
                flags,
                j;

            // header
            cell = "";
            for (i = 0; i < this.token.header.length; i++) {
              flags = { header: true, align: this.token.align[i] };
              cell += this.renderer.tablecell(this.inline.output(this.token.header[i]), { header: true, align: this.token.align[i] });
            }
            header += this.renderer.tablerow(cell);

            for (i = 0; i < this.token.cells.length; i++) {
              row = this.token.cells[i];

              cell = "";
              for (j = 0; j < row.length; j++) {
                cell += this.renderer.tablecell(this.inline.output(row[j]), { header: false, align: this.token.align[j] });
              }

              body += this.renderer.tablerow(cell);
            }
            return this.renderer.table(header, body);
          }
        case "blockquote_start":
          {
            var body = "";

            while (this.next().type !== "blockquote_end") {
              body += this.tok();
            }

            return this.renderer.blockquote(body);
          }
        case "list_start":
          {
            var body = "",
                listType = this.token.listType,
                start = this.token.start;

            while (this.next().type !== "list_end") {
              body += this.tok();
            }

            return this.renderer.list(body, listType, start);
          }
        case "list_item_start":
          {
            var body = "";

            var _listType = this.token.listType,
                title = this.token.bullet;

            while (this.next().type !== "list_item_end") {
              body += this.token.type === "text" ? this.parseText() : this.tok();
            }

            if (_listType === "definition") {
              return this.renderer.definitionListItem(body, title);
            } else {
              return this.renderer.listitem(body);
            }
          }
        case "html":
          {
            var html = !this.token.pre && !this.options.pedantic ? this.inline.output(this.token.text) : this.token.text;
            return this.renderer.html(html);
          }
        case "paragraph":
          {
            return this.renderer.paragraph(this.inline.output(this.token.text));
          }
        case "text":
          {
            return this.renderer.paragraph(this.parseText());
          }
      }
    }
  }], [{
    key: "parse",
    value: function parse(src, options) {
      return new Parser(options).parse(src);
    }
  }]);

  return Parser;
})();

exports["default"] = Parser;
module.exports = exports["default"];