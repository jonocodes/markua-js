import { escape, unescape } from "./constants";

class Renderer {
  constructor(options = {}) {
    this.options = options;
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
  };

  blockquote(quote) {
    return `<blockquote>\n${quote}</blockquote>\n`;
  };

  heading(text, level, raw) {
    return '<h'
      + level
      + ' id="'
      + this.options.headerPrefix
      + raw.toLowerCase().replace(/[^\w]+/g, '-')
      + '">'
      + text
      + '</h'
      + level
      + '>\n';
  };

  hr() {
    return '<hr>\n';
  };

  list(body, ordered) {
    var type = ordered ? 'ol' : 'ul';
    return `<${type}>\n${body}</${type}>\n`;
  };

  listitem(text) {
    return `<li>${text}</li>\n`;
  };

  paragraph(text) {
    return `<p>${text}</p>\n`;
  };

  table(header, body) {
    return '<table>\n'
      + '<thead>\n'
      + header
      + '</thead>\n'
      + '<tbody>\n'
      + body
      + '</tbody>\n'
      + '</table>\n';
  };

  tablerow(content) {
    return `<tr>\n${content}</tr>\n`;
  };

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
