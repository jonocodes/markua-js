import { escape, unescape, HEADING_BOOK_CLASS_MAP, HEADING_MULTI_PART_CLASS_MAP, HEADING_DOCUMENT_CLASS_MAP } from "./constants";
import { decimalize, ALPHABET } from "./util"

class Renderer {
  constructor(options = {}) {
    this.options = options;
  }

  getHeadingClass(level) {
    switch (this.options.bookType) {
      case "book":
        return HEADING_BOOK_CLASS_MAP[level]
      case "multi-part-book":
        return HEADING_MULTI_PART_CLASS_MAP[level]
      case "document":
        return HEADING_DOCUMENT_CLASS_MAP[level]
      default:
        return "";
    }
  }

  code(code, lang, escaped) {
    if (this.options.highlight) {
      var out = this.options.highlight(code, lang);
      if (out != null && out !== code) {
        escaped = true;
        code = out;
      }
    }

    if (!lang) {
      return `<pre><code>${(escaped ? code : escape(code, true))}\n</code></pre>`;
    }

    return '<pre><code class="'
      + this.options.langPrefix
      + escape(lang, true)
      + '">'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>\n';
  }

  blockquote(quote) {
    return `<blockquote>\n${quote}</blockquote>\n`;
  }

  heading(text, level, raw) {
    return '<h'
      + level
      + ` class="${this.getHeadingClass(level)}"`
      + ` id="${this.options.headerPrefix}${raw.toLowerCase().replace(/[^\w]+/g, '-')}">`
      + text
      + '</h'
      + level
      + '>\n';
  }

  hr() {
    return '<hr>\n';
  }

  list(body, listType, start) {
    var type, startAttr = '';
    start = start.substr(0, start.length - 1);

    switch (listType) {
      case 'bullet':
        type = `ul`;
        break;
      case 'alphabetized':
        type = `ol type="${start === start.toUpperCase() ? 'A' : 'a'}"`;
        startAttr = ` start='${ALPHABET.indexOf(start.toUpperCase()) + 1}'`;
        break;
      case 'definition':
        type = `dl`;
        break;
      case 'numeral':
        type = `ol type="${start === start.toUpperCase() ? 'I': 'i'}"`;
        start = decimalize(start) || 0;
        break;
      case 'number':
        type = `ol`;
        startAttr = ` start='${start}'`;
        break;
      default:
        type = `ol`;
    }

    return `<${type}${startAttr}>\n${body}</${type}>\n`;
  }

  definitionListItem(text, title) {
    return `<dt>${title}</dt>\n<dd>${text}</dd>\n`;
  }

  listitem(text) {
    return `<li>${text}</li>\n`;
  }

  paragraph(text) {
    return `<p>${text}</p>\n`;
  }

  table(header, body) {
    return '<table>\n'
      + '<thead>\n'
      + header
      + '</thead>\n'
      + '<tbody>\n'
      + body
      + '</tbody>\n'
      + '</table>\n';
  }

  tablerow(content) {
    return `<tr>\n${content}</tr>\n`;
  }

  tablecell(content, flags) {
    var type = flags.header ? 'th' : 'td';
    var tag = flags.align
      ? `<${type} style="text-align: ${flags.align}">`
      : `<${type}>`;
    return tag + content + '</' + type + '>\n';
  };

  // span level renderer
  strong(text) {
    return `<strong>${text}</strong>`;
  };

  em(text) {
    return `<em>${text}</em>`;
  };

  codespan(text) {
    return `<code>${text}</code>`;
  };

  br() {
    return '<br>';
  };

  del(text) {
    return `<del>${text}</del>`;
  };

  link(href, title, text) {
    if (this.options.sanitize) {
      try {
        var prot = decodeURIComponent(unescape(href))
          .replace(/[^\w:]/g, '')
          .toLowerCase();
      } catch (e) {
        return '';
      }
      if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
        return '';
      }
    }
    var out = `<a href="${href}"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += `>${text}</a>`;
    return out;
  };

  image(href, title, text) {
    var out = `<img src="${href}" alt="${text}"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += '>';
    return out;
  };
}

export default Renderer;
