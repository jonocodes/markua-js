"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _escape$unescape$HEADING_BOOK_CLASS_MAP$HEADING_MULTI_PART_CLASS_MAP$HEADING_DOCUMENT_CLASS_MAP = require("./constants");

var _decimalize$ALPHABET = require("./util");

var Renderer = (function () {
  function Renderer() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Renderer);

    this.options = options;
  }

  _createClass(Renderer, [{
    key: "getHeadingClass",
    value: function getHeadingClass(level) {
      switch (this.options.bookType) {
        case "book":
          return _escape$unescape$HEADING_BOOK_CLASS_MAP$HEADING_MULTI_PART_CLASS_MAP$HEADING_DOCUMENT_CLASS_MAP.HEADING_BOOK_CLASS_MAP[level];
        case "multi-part-book":
          return _escape$unescape$HEADING_BOOK_CLASS_MAP$HEADING_MULTI_PART_CLASS_MAP$HEADING_DOCUMENT_CLASS_MAP.HEADING_MULTI_PART_CLASS_MAP[level];
        case "document":
          return _escape$unescape$HEADING_BOOK_CLASS_MAP$HEADING_MULTI_PART_CLASS_MAP$HEADING_DOCUMENT_CLASS_MAP.HEADING_DOCUMENT_CLASS_MAP[level];
        default:
          return "";
      }
    }
  }, {
    key: "code",
    value: (function (_code) {
      function code(_x, _x2, _x3) {
        return _code.apply(this, arguments);
      }

      code.toString = function () {
        return _code.toString();
      };

      return code;
    })(function (code, lang, escaped) {
      if (this.options.highlight) {
        var out = this.options.highlight(code, lang);
        if (out !== null && out !== code) {
          escaped = true;
          code = out;
        }
      }

      if (!lang) {
        return "<pre><code>" + (escaped ? code : _escape$unescape$HEADING_BOOK_CLASS_MAP$HEADING_MULTI_PART_CLASS_MAP$HEADING_DOCUMENT_CLASS_MAP.escape(code, true)) + "\n</code></pre>";
      }

      return "<pre><code class=\"" + this.options.langPrefix + _escape$unescape$HEADING_BOOK_CLASS_MAP$HEADING_MULTI_PART_CLASS_MAP$HEADING_DOCUMENT_CLASS_MAP.escape(lang, true) + "\">" + (escaped ? code : _escape$unescape$HEADING_BOOK_CLASS_MAP$HEADING_MULTI_PART_CLASS_MAP$HEADING_DOCUMENT_CLASS_MAP.escape(code, true)) + "\n</code></pre>\n";
    })
  }, {
    key: "blockquote",
    value: function blockquote(quote) {
      return "<blockquote>\n" + quote + "</blockquote>\n";
    }
  }, {
    key: "figure",
    value: function figure(altText, image, captionText, attributes) {
      var _ref = attributes || {};

      var align = _ref.align;
      var alt = _ref.alt;
      var caption = _ref.caption;

      var attrs = "class='figure";
      attrs += align ? " " + align + "'" : "'";

      alt = altText || alt || "";
      caption = captionText || caption;

      var div = "<div " + attrs + ">\n  " + this.image(image, null, alt) + "\n" + this.caption(caption) + "</div>\n";
      return div;
    }
  }, {
    key: "caption",
    value: function caption(text) {
      return text ? "  <p class='caption'>" + text + "</p>\n" : "";
    }
  }, {
    key: "heading",
    value: function heading(text, level, raw) {
      return "<h" + level + (" class=\"" + this.getHeadingClass(level) + "\"") + (" id=\"" + this.options.headerPrefix + "" + raw.toLowerCase().replace(/[^\w]+/g, "-") + "\">") + text + "</h" + level + ">\n";
    }
  }, {
    key: "hr",
    value: function hr() {
      return "<hr>\n";
    }
  }, {
    key: "list",
    value: function list(body, listType, start) {
      var typeTag,
          typeAttribute = "",
          startAttr = "";
      start = start.substr(0, start.length - 1);

      switch (listType) {
        case "bullet":
          typeTag = "ul";
          break;
        case "alphabetized":
          typeTag = "ol";
          typeAttribute = " type=\"" + (start === start.toUpperCase() ? "A" : "a") + "\"";
          startAttr = start.toUpperCase() === "A" ? "" : " start='" + (_decimalize$ALPHABET.ALPHABET.indexOf(start.toUpperCase()) + 1) + "'";
          break;
        case "definition":
          typeTag = "dl";
          break;
        case "numeral":
          typeTag = "ol";
          typeAttribute = " type=\"" + (start === start.toUpperCase() ? "I" : "i") + "\"";
          startAttr = (start = _decimalize$ALPHABET.decimalize(start) || 0) && start !== 1 ? " start=\"" + start + "\"" : "";
          break;
        case "number":
          typeTag = "ol";
          startAttr = start && start !== "1" ? " start='" + start + "'" : "";
          break;
        default:
          typeTag = "ol";
      }

      return "<" + typeTag + "" + typeAttribute + "" + startAttr + ">\n" + body + "</" + typeTag + ">\n";
    }
  }, {
    key: "definitionListItem",
    value: function definitionListItem(text, title) {
      return "<dt>" + title + "</dt>\n<dd>" + text + "</dd>\n";
    }
  }, {
    key: "listitem",
    value: function listitem(text) {
      return "<li>" + text + "</li>\n";
    }
  }, {
    key: "paragraph",
    value: function paragraph(text) {
      return "<p>" + text + "</p>\n";
    }
  }, {
    key: "table",
    value: function table(header, body) {
      return "<table>\n" + "<thead>\n" + header + "</thead>\n" + "<tbody>\n" + body + "</tbody>\n" + "</table>\n";
    }
  }, {
    key: "tablerow",
    value: function tablerow(content) {
      return "<tr>\n" + content + "</tr>\n";
    }
  }, {
    key: "tablecell",
    value: function tablecell(content, flags) {
      var type = flags.header ? "th" : "td";
      var tag = flags.align ? "<" + type + " style=\"text-align: " + flags.align + "\">" : "<" + type + ">";
      return tag + content + "</" + type + ">\n";
    }
  }, {
    key: "strong",

    // span level renderer
    value: function strong(text) {
      return "<strong>" + text + "</strong>";
    }
  }, {
    key: "em",
    value: function em(text) {
      return "<em>" + text + "</em>";
    }
  }, {
    key: "codespan",
    value: function codespan(text) {
      return "<code>" + text + "</code>";
    }
  }, {
    key: "br",
    value: function br() {
      return "<br>";
    }
  }, {
    key: "del",
    value: function del(text) {
      return "<del>" + text + "</del>";
    }
  }, {
    key: "link",
    value: function link(href, title, text) {
      if (this.options.sanitize) {
        try {
          var prot = decodeURIComponent(_escape$unescape$HEADING_BOOK_CLASS_MAP$HEADING_MULTI_PART_CLASS_MAP$HEADING_DOCUMENT_CLASS_MAP.unescape(href)).replace(/[^\w:]/g, "").toLowerCase();
        } catch (e) {
          return "";
        }
        if (prot.indexOf("javascript:") === 0 || prot.indexOf("vbscript:") === 0) {
          return "";
        }
      }
      var out = "<a href=\"" + href + "\"";
      if (title) {
        out += " title=\"" + title + "\"";
      }
      out += ">" + text + "</a>";
      return out;
    }
  }, {
    key: "image",
    value: function image(href, title, text) {
      if (!/http:|https:/.test(href)) href = "images/" + href;

      var out = "<img src=\"" + href + "\" alt=\"" + text + "\"";
      if (title) {
        out += " title=\"" + title + "\"";
      }
      out += "/>";
      return out;
    }
  }]);

  return Renderer;
})();

exports["default"] = Renderer;
module.exports = exports["default"];