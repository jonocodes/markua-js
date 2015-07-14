"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _constants = require("./constants");

var _util = require("./util");

var _ = require("underscore");

var Renderer = (function () {
  function Renderer() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Renderer);

    this.options = options;
  }

  _createClass(Renderer, [{
    key: "getHeadingClass",

    // Return the correct heading class for the type of book that we are writing.
    value: function getHeadingClass(level) {
      switch (this.options.bookType) {
        case "book":
          return _constants.HEADING_BOOK_CLASS_MAP[level];
        case "multi-part-book":
          return _constants.HEADING_MULTI_PART_CLASS_MAP[level];
        case "document":
          return _constants.HEADING_DOCUMENT_CLASS_MAP[level];
        default:
          return "";
      }
    }
  }, {
    key: "convertAttributes",

    // Take a object of attributes, and return a string that will be placed on the tag.
    value: function convertAttributes(attributes, className) {
      if (!attributes) {
        return className ? " class=\"" + className + "\"" : "";
      }
      var attrString = " ";

      // If we have a class specified in the tag that we are rendering, then make sure to add that
      // class as well.
      if (className) {
        attrString += attributes["class"] ? "class=\"" + className + " " + attributes["class"] + "\" " : "class=\"" + className + "\"";
        delete attributes["class"];
      }

      _.each(_.keys(attributes), function (key, i) {
        attrString += key + "=\"" + attributes[key] + "\"";
      });
      return attrString;;
    }
  }, {
    key: "code",
    value: function code(_code, lang, escaped, attributes) {
      // override the language from the attribute if we have to.
      if (attributes && attributes["lang"]) {
        lang = attributes["lang"];
        delete attributes["lang"];
      }

      var attributesString = this.convertAttributes(attributes);

      if (this.options.highlight) {
        var out = this.options.highlight(_code, lang);
        if (out !== null && out !== _code) {
          escaped = true;
          _code = out;
        }
      }

      if (!lang) {
        return "<pre" + attributesString + "><code>" + (escaped ? _code : (0, _constants.escape)(_code, true)) + "\n</code></pre>";
      }

      return "<pre" + attributesString + "><code class=\"" + this.options.langPrefix + (0, _constants.escape)(lang, true) + "\">" + (escaped ? _code : (0, _constants.escape)(_code, true)) + "\n</code></pre>\n";
    }
  }, {
    key: "aside",
    value: function aside(text, attributes) {
      var attrs = this.convertAttributes(attributes, "aside");
      return "<div" + attrs + ">\n" + text + "</div>\n";
    }
  }, {
    key: "blurb",
    value: function blurb(text, attributes) {
      var attrs = this.convertAttributes(attributes, "blurb");
      return "<div" + attrs + ">\n" + text + "</div>\n";
    }
  }, {
    key: "blockquote",
    value: function blockquote(quote, attributes) {
      var attrs = this.convertAttributes(attributes);
      return "<blockquote" + attrs + ">\n" + quote + "</blockquote>\n";
    }
  }, {
    key: "figure",
    value: function figure(altText, image, captionText, attributes) {
      var _ref = attributes || {};

      var align = _ref.align;
      var alt = _ref.alt;
      var caption = _ref.caption;

      // Take em out
      attributes = _.omit(attributes, "align", "alt", "caption");

      // Determine the class
      var className = "figure";
      className += align ? " " + align : "";

      // Figure out alt-text and caption
      alt = altText || alt || "";
      caption = captionText || caption;

      // Get the other attributes
      var attrs = this.convertAttributes(attributes, className);

      var div = "<div" + attrs + ">\n  " + this.image(image, null, alt) + "\n" + this.caption(caption) + "</div>\n";
      return div;
    }
  }, {
    key: "caption",
    value: function caption(text, attributes) {
      var attrs = this.convertAttributes(attributes, "caption");
      return text ? "  <p" + attrs + ">" + text + "</p>\n" : "";
    }
  }, {
    key: "heading",
    value: function heading(text, level, raw, attributes) {
      var id = undefined;

      if (attributes && attributes.id) {
        id = attributes.id;
        delete attributes["id"];
      } else {
        id = this.options.headerPrefix + raw.toLowerCase().replace(/[^\w]+/g, "-");
      }

      var attrs = this.convertAttributes(attributes, this.getHeadingClass(level));

      return "<h" + level + ("" + attrs) + (" id=" + id + ">") + text + "</h" + level + ">\n";
    }
  }, {
    key: "hr",
    value: function hr(attributes) {
      var attrs = this.convertAttributes(attributes);
      return "<hr" + attrs + ">\n";
    }
  }, {
    key: "list",
    value: function list(body, listType, start, attributes) {
      var typeTag,
          typeAttribute = "",
          startAttr = "";
      start = start.substr(0, start.length - 1);

      // Figure out the type of list, add some attributes
      switch (listType) {
        case "bullet":
          typeTag = "ul";
          break;
        case "alphabetized":
          typeTag = "ol";
          typeAttribute = " type=\"" + (start === start.toUpperCase() ? "A" : "a") + "\"";
          startAttr = start.toUpperCase() === "A" ? "" : " start=\"" + (_util.ALPHABET.indexOf(start.toUpperCase()) + 1) + "\"";
          break;
        case "definition":
          typeTag = "dl";
          break;
        case "numeral":
          typeTag = "ol";
          typeAttribute = " type=\"" + (start === start.toUpperCase() ? "I" : "i") + "\"";
          startAttr = (start = (0, _util.decimalize)(start) || 0) && start !== 1 ? " start=\"" + start + "\"" : "";
          break;
        case "number":
          typeTag = "ol";
          startAttr = start && start !== "1" ? " start=\"" + start + "\"" : "";
          break;
        default:
          typeTag = "ol";
      }

      // Get the generic attributes for the list
      var genericAttrs = this.convertAttributes(attributes);

      return "<" + typeTag + typeAttribute + startAttr + genericAttrs + ">\n" + body + "</" + typeTag + ">\n";
    }
  }, {
    key: "definitionListItem",
    value: function definitionListItem(text, title, attributes) {
      var attrs = this.convertAttributes(attributes);
      return "<dt" + attrs + ">" + title + "</dt>\n<dd>" + text + "</dd>\n";
    }
  }, {
    key: "listitem",
    value: function listitem(text, attributes) {
      var attrs = this.convertAttributes(attributes);
      return "<li" + attrs + ">" + text + "</li>\n";
    }
  }, {
    key: "paragraph",
    value: function paragraph(text, attributes) {
      text = text.replace(/\n/g, "<br/>\n");
      var attrs = this.convertAttributes(attributes);
      return "<p" + attrs + ">" + text + "</p>\n";
    }
  }, {
    key: "table",
    value: function table(header, body, attributes) {
      var attrs = this.convertAttributes(attributes);
      return "<table" + attrs + ">\n" + "<thead>\n" + header + "</thead>\n" + "<tbody>\n" + body + "</tbody>\n" + "</table>\n";
    }
  }, {
    key: "tablerow",
    value: function tablerow(content, attributes) {
      var attrs = this.convertAttributes(attributes);
      return "<tr" + attrs + ">\n" + content + "</tr>\n";
    }
  }, {
    key: "tablecell",
    value: function tablecell(content, flags, attributes) {
      var type = flags.header ? "th" : "td";
      var tag = flags.align ? "<" + type + " style=\"text-align: " + flags.align + "\">" : "<" + type + ">";
      return tag + content + "</" + type + ">\n";
    }
  }, {
    key: "cursor",

    // Cursor
    value: function cursor() {
      return "<span id=\"__markuaCursorPosition__\"></span>";
    }
  }, {
    key: "strong",

    // span level renderer
    value: function strong(text, attributes) {
      var attrs = this.convertAttributes(attributes);
      return "<strong" + attrs + ">" + text + "</strong>";
    }
  }, {
    key: "em",
    value: function em(text, attributes) {
      var attrs = this.convertAttributes(attributes);
      return "<em" + attrs + ">" + text + "</em>";
    }
  }, {
    key: "codespan",
    value: function codespan(text, attributes) {
      var attrs = this.convertAttributes(attributes);
      return "<code" + attrs + ">" + text + "</code>";
    }
  }, {
    key: "br",
    value: function br() {
      return "<br>";
    }
  }, {
    key: "del",
    value: function del(text, attributes) {
      return "<del>" + text + "</del>";
    }
  }, {
    key: "link",
    value: function link(href, title, text, attributes) {
      if (this.options.sanitize) {
        try {
          var prot = decodeURIComponent((0, _constants.unescape)(href)).replace(/[^\w:]/g, "").toLowerCase();
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
    value: function image(href, title, text, attributes) {
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