"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _block = require("./constants");

var _characterIsNext = require("./util");

var _ = require("underscore");

// Class for lexing block elements of markua

var Lexer = (function () {
  function Lexer() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Lexer);

    this.tokens = [];
    this.tokens.links = {};
    this.options = options;
    this.rules = _block.block.normal;
    this.warnings = [];
  }

  _createClass(Lexer, [{
    key: "lex",
    value: function lex(src) {
      // Preprocess
      src = src.replace(/\r\n|\r/g, "\n").replace(/\t/g, "    ").replace(/\u00a0/g, " ").replace(/\u2424/g, "\n");

      // Go go go
      return this.token(src, true);
    }
  }, {
    key: "token",
    value: function token(src, top, bq) {
      var _this = this;

      var cap = undefined;
      src = src.replace(/^ +$/gm, "");

      while (src) {
        // newline
        if (cap = this.rules.newline.exec(src)) {
          src = src.substring(cap[0].length);
          if (cap[0].length > 1) this.tokens.push({ type: "space" });
        }

        // attribute
        if (cap = this.rules.attribute.group.exec(src)) {
          src = src.substring(cap[0].length);

          var attributes = [];
          var pair = undefined;

          while ((pair = _.compact(this.rules.attribute.value.exec(cap[0]))).length) {
            attributes.push({ key: pair[1], value: pair[2] });
          }

          this.tokens.push({
            type: "attribute",
            attributes: attributes
          });
          continue;
        }

        // code
        if (cap = this.rules.code.exec(src)) {
          src = src.substring(cap[0].length);
          cap = cap[0].replace(/^ {4}/gm, "");
          this.tokens.push({
            type: "code",
            text: cap
          });
          continue;
        }

        // fences (gfm)
        if (cap = this.rules.fences.exec(src)) {
          src = src.substring(cap[0].length);
          this.tokens.push({
            type: "code",
            lang: cap[2],
            text: cap[3]
          });
          continue;
        }

        // heading
        if (cap = this.rules.heading.exec(src)) {
          src = src.substring(cap[0].length);

          // Check to make sure there is another newline under this thing
          if (!this.rules["break"].exec(src)) {
            this.warnings.push("Must be a newline after " + cap[0]);
          }

          this.tokens.push({
            type: "heading",
            depth: cap[1].length,
            text: cap[2]
          });
          continue;
        }

        // table no leading pipe (gfm)
        if (top && (cap = this.rules.nptable.exec(src))) {
          src = src.substring(cap[0].length);
          var item = {
            type: "table",
            header: cap[1].replace(/^ *| *\| *$/g, "").split(RegExp(" *\\| *")),
            align: cap[2].replace(/^ *|\| *$/g, "").split(RegExp(" *\\| *")),
            cells: cap[3].replace(/\n$/, "").split("\n")
          };

          for (var i = 0; i < item.align.length; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = "right";
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = "center";
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = "left";
            } else {
              item.align[i] = null;
            }
          }

          for (var i = 0; i < item.cells.length; i++) {
            item.cells[i] = item.cells[i].split(RegExp(" *\\| *"));
          }

          this.tokens.push(item);
          continue;
        }

        // hr
        if (cap = this.rules.hr.exec(src)) {
          src = src.substring(cap[0].length);
          this.tokens.push({ type: "hr" });
          continue;
        }

        // blockquote
        if (cap = this.rules.blockquote.exec(src)) {
          src = src.substring(cap[0].length);

          this.tokens.push({ type: "blockquote_start" });

          cap = cap[0].replace(/^ *> ?/gm, "");

          // Pass `top` to keep the current
          // "toplevel" state. This is exactly
          // how markdown.pl works.
          this.token(cap, top, true);
          this.tokens.push({ type: "blockquote_end" });
          continue;
        }

        // list
        if (cap = this.rules.list.body.exec(src)) {
          var prevIndex, next, l, definitionTitle;

          var _ret = (function () {
            src = src.substring(cap[0].length);
            var bull = cap[2];

            // Determine what number the list will start with -- if it's a numbered
            // list
            var listType = undefined;

            if (_this.rules.list.number.exec(bull)) listType = "number";else if (_this.rules.list.alphabetized.exec(bull)) listType = "alphabetized";else if (_this.rules.list.numeral.exec(bull)) listType = "numeral";else if (_this.rules.list.bullet.exec(bull)) listType = "bullet";else if (_this.rules.list.definition.exec(bull)) listType = "definition";

            _this.tokens.push({
              type: "list_start",
              listType: listType,
              start: bull
            });

            // Get each top-level item.
            cap = cap[0].match(_this.rules.item);

            prevIndex = null;
            next = false;
            l = cap.length;
            definitionTitle = null;

            var _loop = function (i) {
              var item = cap[i];

              // If the list order matters, and we aren't at the start, ensure that
              // the current index is one greater than the previous
              var currentIndex = (function () {
                var current = undefined;
                warning = "List indices should be consecutive, automatically increasing near " + cap[0];
                switch (listType) {
                  case "number":
                    current = parseInt(_this.rules.number.exec(item)[1]);

                    // Warn for numeric lists
                    if (prevIndex !== null && current !== 1 + prevIndex) _this.warnings.push(warning);

                    return current;
                  case "alphabetized":
                    current = _this.rules.list.alphabetized.exec(item)[1];

                    // Warn for alpha list
                    if (prevIndex !== null && !_characterIsNext.characterIsNext(current, prevIndex)) _this.warnings.push(warning);

                    return current;
                  case "numeral":
                    return _this.rules.list.numeral.exec(item)[1];
                  case "bullet":
                    return null;
                  case "definition":
                    definitionTitle = item.match(_this.rules.bullet)[2];
                    return null;
                }
              })();

              // Remove the list item's bullet
              // so it is seen as the next token.
              var space = item.length;
              item = item.replace(_this.rules.bullet, "");

              // Outdent whatever the
              // list item contains. Hacky.
              if (~item.indexOf("\n ")) {
                space -= item.length;
                item = item.replace(/^ {1,4}/gm, "");
              }

              _this.tokens.push({ type: "list_item_start", listType: listType, bullet: listType === "definition" ? definitionTitle : bull });

              // Recurse.
              _this.token(item, false, bq);
              _this.tokens.push({ type: "list_item_end" });
              prevIndex = currentIndex;
            };

            for (var i = 0; i < l; i++) {
              _loop(i);
            }
            _this.tokens.push({ type: "list_end" });
            return "continue";
          })();

          if (_ret === "continue") continue;
        }

        // def
        if (!bq && top && (cap = this.rules.def.exec(src))) {
          src = src.substring(cap[0].length);
          this.tokens.links[cap[1].toLowerCase()] = {
            href: cap[2],
            title: cap[3]
          };
          continue;
        }

        // table (gfm)
        if (top && (cap = this.rules.table.exec(src))) {
          src = src.substring(cap[0].length);
          var item = {
            type: "table",
            header: cap[1].replace(/^ *| *\| *$/g, "").split(RegExp(" *\\| *")),
            align: cap[2].replace(/^ *|\| *$/g, "").split(RegExp(" *\\| *")),
            cells: cap[3].replace(/(?: *\| *)?\n$/, "").split("\n")
          };

          for (var i = 0; i < item.align.length; i++) {
            if (/^ *-+: *$/.test(item.align[i])) item.align[i] = "right";else if (/^ *:-+: *$/.test(item.align[i])) item.align[i] = "center";else if (/^ *:-+ *$/.test(item.align[i])) item.align[i] = "left";else item.align[i] = null;
          }

          for (var i = 0; i < item.cells.length; i++) {
            item.cells[i] = item.cells[i].replace(/^ *\| *| *\| *$/g, "").split(RegExp(" *\\| *"));
          }

          this.tokens.push(item);
          continue;
        }

        // top-level paragraph
        if (top && (cap = this.rules.paragraph.exec(src))) {
          src = src.substring(cap[0].length);
          this.tokens.push({
            type: "paragraph",
            text: cap[1].charAt(cap[1].length - 1) == "\n" ? cap[1].slice(0, -1) : cap[1]
          });
          continue;
        }

        // text
        if (cap = this.rules.text.exec(src)) {
          // Top-level should never reach here.
          src = src.substring(cap[0].length);
          this.tokens.push({
            type: "text",
            text: cap[0]
          });
          continue;
        }

        if (src) throw new Error("Infinite loop on byte: " + src.charCodeAt(0));
      }

      if (this.options.debug) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.warnings[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var warning = _step.value;

            console.warn(warning);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this.warnings = [];
      }

      return this.tokens;
    }
  }], [{
    key: "lex",
    value: function lex(src, options) {
      var lexer = new Lexer(options);
      return lexer.lex(src);
    }
  }]);

  return Lexer;
})();

;

exports["default"] = Lexer;
module.exports = exports["default"];