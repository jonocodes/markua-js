"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _constants = require("./constants");

var _renderer = require("./renderer");

var _renderer2 = _interopRequireDefault(_renderer);

var _ = require("underscore");

// Lexes and pipes tokens to the inline renderer

var InlineLexer = (function () {
  function InlineLexer(links, options) {
    _classCallCheck(this, InlineLexer);

    this.options = options;
    this.links = links;
    this.rules = _constants.inline.normal;
    this.attributeSet = null;
    this.prevAttributeSet = null;
    this.renderer = new _renderer2["default"]();

    if (!this.links) throw new Error("Tokens array requires a `links` property.");
  }

  _createClass(InlineLexer, [{
    key: "output",

    // lex and send tokens to the renderer
    value: function output(src) {
      var cap = undefined,
          link = undefined,
          text = undefined,
          href = undefined,
          out = "";

      while (src) {
        // Clear the attributes unless the last thing was an attribute
        if (!this.prevAttributeSet) this.attributeSet = null;
        this.prevAttributeSet = null;

        // escape
        if (cap = this.rules.escape.exec(src)) {
          src = src.substring(cap[0].length);
          out += cap[1];
          continue;
        }

        // autolink
        if (cap = this.rules.autolink.exec(src)) {
          src = src.substring(cap[0].length);
          if (cap[2] === "@") {
            text = cap[1].charAt(6) === ":" ? cap[1].substring(7) : cap[1];
            href = "mailto:" + text;
          } else {
            text = (0, _constants.escape)(cap[1]);
            href = text;
          }
          out += this.renderer.link(href, null, text, this.attributeSet && this.attributeSet.attributes);
          continue;
        }

        // attributes
        if (cap = this.rules.attribute.inlineGroup.exec(src)) {
          // Since there could be text before the match (middle of a paragraph)
          // we need to cut the attributes out.
          var index = src.search(this.rules.attribute.inlineGroup);
          var _length = cap[0].length;

          src = _.string.splice(src, index, cap[0].length);

          var attributes = [];
          var pair = undefined;

          while ((pair = _.compact(this.rules.attribute.value.exec(cap[0]))).length) {
            attributes.push({ key: pair[1], value: pair[2] });
          }

          this.attributeSet = { attributes: attributes, index: index };
          this.prevAttributeSet = true;
          continue;
        }

        // url (gfm)
        if (!this.inLink && (cap = this.rules.url.exec(src))) {
          src = src.substring(cap[0].length);
          text = (0, _constants.escape)(cap[1]);
          href = text;
          out += this.renderer.link(href, null, text, this.attributeSet && this.attributeSet.attributes);
          continue;
        }

        // link
        if (cap = this.rules.link.exec(src)) {
          src = src.substring(cap[0].length);
          this.inLink = true;
          out += this.outputLink(cap, {
            href: cap[2],
            title: cap[3]
          });
          this.inLink = false;
          continue;
        }

        // reflink, nolink
        if ((cap = this.rules.reflink.exec(src)) || (cap = this.rules.nolink.exec(src))) {
          src = src.substring(cap[0].length);
          link = (cap[2] || cap[1]).replace(/\s+/g, " ");
          link = this.links[link.toLowerCase()];
          if (!link || !link.href) {
            out += cap[0].charAt(0);
            src = cap[0].substring(1) + src;
            continue;
          }
          this.inLink = true;
          out += this.outputLink(cap, link);
          this.inLink = false;
          continue;
        }

        // strong
        if (cap = this.rules.strong.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.strong(this.output(cap[2] || cap[1]), this.attributeSet && this.attributeSet.attributes);
          continue;
        }

        // em
        if (cap = this.rules.em.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.em(this.output(cap[2] || cap[1]), this.attributeSet && this.attributeSet.attributes);
          continue;
        }

        // code
        if (cap = this.rules.code.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.codespan((0, _constants.escape)(cap[2], true), this.attributeSet && this.attributeSet.attributes);
          continue;
        }

        // br
        if (cap = this.rules.br.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.br();
          continue;
        }

        // del (gfm)
        if (cap = this.rules.del.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.del(this.output(cap[1]), this.attributeSet && this.attributeSet.attributes);
          continue;
        }

        // text
        if (cap = this.rules.text.exec(src)) {
          if (this.attributeSet) {
            // We have found an attribute set in the text.  This means that
            // we should create a span and attach the attributes to that span.
            //
            // Example
            // input:
            //    This is paragraph text { foo: bar } something.
            // output:
            //    <p>This is paragraph text <span foo="bar">something.</span>

            var beforeAttrs = cap[0].substr(0, this.attributeSet.index);
            var afterAttrs = cap[0].substr(this.attributeSet.index);

            if (afterAttrs.length) {
              // We have things that come after the attribute
              // Wrap it in a span and add the attributes to that span.
              out += (0, _constants.escape)(this.smartypants(beforeAttrs));
              out += this.renderer.span((0, _constants.escape)(this.smartypants(afterAttrs)), this.attributeSet.attributes);
            }
          } else {
            out += (0, _constants.escape)(this.smartypants(cap[0]));
          }
          src = src.substring(cap[0].length);
          continue;
        }

        if (src) {
          throw new Error("Infinite loop on byte: " + src.charCodeAt(0));
        }
      }

      // We have attributes that we have to put on the previous element
      // if (this.attributeSet)
      // console.log("TODO: @bradens, need to attach attrs to the previous element")
      return out;
    }
  }, {
    key: "outputLink",

    // Compile a link or Image
    value: function outputLink(cap, link) {
      var href = (0, _constants.escape)(link.href),
          title = link.title ? (0, _constants.escape)(link.title) : null;

      return cap[0].charAt(0) !== "!" ? this.renderer.link(href, title, this.output(cap[1]), this.attributeSet && this.attributeSet.attributes) : this.renderer.image(href, title, (0, _constants.escape)(cap[1]), this.attributeSet && this.attributeSet.attributes);
    }
  }, {
    key: "smartypants",

    // Turn dashes and stuff into special characters
    // -- SmartyPants
    value: function smartypants(text) {
      return text
      // em-dashes
      .replace(/--/g, "—")
      // opening singles
      .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1‘")
      // closing singles & apostrophes
      .replace(/'/g, "’")
      // opening doubles
      .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1“")
      // closing doubles
      .replace(/"/g, "”")
      // ellipses
      .replace(/\.{3}/g, "…");
    }
  }], [{
    key: "output",

    // Exposed output function
    value: function output(src, links, options) {
      return new InlineLexer(links, options).output(src);
    }
  }]);

  return InlineLexer;
})();

// Expose rules
InlineLexer.rules = _constants.inline;

exports["default"] = InlineLexer;
module.exports = exports["default"];