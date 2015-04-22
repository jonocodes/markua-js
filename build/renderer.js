'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _escape$unescape = require('./constants');

var Renderer = (function () {
  function Renderer() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Renderer);

    this.options = options;
  }

  _createClass(Renderer, [{
    key: 'code',
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
        if (out != null && out !== code) {
          escaped = true;
          code = out;
        }
      }

      if (!lang) {
        return '<pre><code>' + (escaped ? code : _escape$unescape.escape(code, true)) + '\n</code></pre>';
      }

      return '<pre><code class="' + this.options.langPrefix + _escape$unescape.escape(lang, true) + '">' + (escaped ? code : _escape$unescape.escape(code, true)) + '\n</code></pre>\n';
    })
  }, {
    key: 'blockquote',
    value: function blockquote(quote) {
      return '<blockquote>\n' + quote + '</blockquote>\n';
    }
  }, {
    key: 'heading',
    value: function heading(text, level, raw) {
      return '<h' + level + ' id="' + this.options.headerPrefix + raw.toLowerCase().replace(/[^\w]+/g, '-') + '">' + text + '</h' + level + '>\n';
    }
  }, {
    key: 'hr',
    value: function hr() {
      return '<hr>\n';
    }
  }, {
    key: 'list',
    value: function list(body, ordered) {
      var type = ordered ? 'ol' : 'ul';
      return '<' + type + '>\n' + body + '</' + type + '>\n';
    }
  }, {
    key: 'listitem',
    value: function listitem(text) {
      return '<li>' + text + '</li>\n';
    }
  }, {
    key: 'paragraph',
    value: function paragraph(text) {
      return '<p>' + text + '</p>\n';
    }
  }, {
    key: 'table',
    value: function table(header, body) {
      return '<table>\n' + '<thead>\n' + header + '</thead>\n' + '<tbody>\n' + body + '</tbody>\n' + '</table>\n';
    }
  }, {
    key: 'tablerow',
    value: function tablerow(content) {
      return '<tr>\n' + content + '</tr>\n';
    }
  }, {
    key: 'tablecell',
    value: function tablecell(content, flags) {
      var type = flags.header ? 'th' : 'td';
      var tag = flags.align ? '<' + type + ' style="text-align: ' + flags.align + '">' : '<' + type + '>';
      return tag + content + '</' + type + '>\n';
    }
  }, {
    key: 'strong',

    // span level renderer
    value: function strong(text) {
      return '<strong>' + text + '</strong>';
    }
  }, {
    key: 'em',
    value: function em(text) {
      return '<em>' + text + '</em>';
    }
  }, {
    key: 'codespan',
    value: function codespan(text) {
      return '<code>' + text + '</code>';
    }
  }, {
    key: 'br',
    value: function br() {
      return '<br>';
    }
  }, {
    key: 'del',
    value: function del(text) {
      return '<del>' + text + '</del>';
    }
  }, {
    key: 'link',
    value: function link(href, title, text) {
      if (this.options.sanitize) {
        try {
          var prot = decodeURIComponent(_escape$unescape.unescape(href)).replace(/[^\w:]/g, '').toLowerCase();
        } catch (e) {
          return '';
        }
        if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
          return '';
        }
      }
      var out = '<a href="' + href + '"';
      if (title) {
        out += ' title="' + title + '"';
      }
      out += '>' + text + '</a>';
      return out;
    }
  }, {
    key: 'image',
    value: function image(href, title, text) {
      var out = '<img src="' + href + '" alt="' + text + '"';
      if (title) {
        out += ' title="' + title + '"';
      }
      out += '>';
      return out;
    }
  }]);

  return Renderer;
})();

exports['default'] = Renderer;
module.exports = exports['default'];