import { escape, unescape, HEADING_BOOK_CLASS_MAP, HEADING_MULTI_PART_CLASS_MAP, HEADING_DOCUMENT_CLASS_MAP } from "./constants";
import { decimalize, ALPHABET } from "./util"
let _ = require("underscore");

class Renderer {
  constructor(options = {}) {
    this.options = options;
  }

  // Return the correct heading class for the type of book that we are writing.
  getHeadingClass(level) {
    switch (this.options.bookType) {
      case "book":
        return HEADING_BOOK_CLASS_MAP[level];
      case "multi-part-book":
        return HEADING_MULTI_PART_CLASS_MAP[level];
      case "document":
        return HEADING_DOCUMENT_CLASS_MAP[level];
      default:
        return "";
    }
  }

  // Take a object of attributes, and return a string that will be placed on the tag.
  convertAttributes(attributes, className) {
    if (!attributes) {
      return className ? ` class="${className}"` : '';
    }
    let attrString = " ";

    // If we have a class specified in the tag that we are rendering, then make sure to add that
    // class as well.
    if (className) {
      attrString += attributes['class'] ? `class="${className} ${attributes['class']}" ` : `class="${className}"`;
      delete attributes['class'];
    }

    _.each(_.keys(attributes), function(key, i) {
      attrString += `${key}="${attributes[key]}"`;
    });
    return attrString;;
  }

  code(code, lang, escaped, attributes) {
    // override the language from the attribute if we have to.
    if (attributes && attributes['lang']) {
      lang = attributes['lang']
      delete attributes['lang'];
    }

    let attributesString = this.convertAttributes(attributes)

    if (this.options.highlight) {
      var out = this.options.highlight(code, lang);
      if (out !== null && out !== code) {
        escaped = true;
        code = out;
      }
    }

    if (!lang) {
      return `<pre${attributesString}><code>${(escaped ? code : escape(code, true))}\n</code></pre>`;
    }

    return `<pre${attributesString}><code class="`
      + this.options.langPrefix
      + escape(lang, true)
      + '">'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>\n';
  }

  aside(text, attributes) {
    let attrs = this.convertAttributes(attributes, "aside")
    return `<div${attrs}>\n${text}</div>\n`;
  }

  blurb(text, attributes) {
    let attrs = this.convertAttributes(attributes, "blurb")
    return `<div${attrs}>\n${text}</div>\n`;
  }

  blockquote(quote, attributes) {
    let attrs = this.convertAttributes(attributes)
    return `<blockquote${attrs}>\n${quote}</blockquote>\n`;
  }

  figure(altText, image, captionText, attributes) {
    let { align, alt, caption } = attributes || {};

    // Take em out
    attributes = _.omit(attributes, "align", "alt", "caption")

    // Determine the class
    let className = `figure`;
    className += align ? ` ${align}` : '';

    // Figure out alt-text and caption
    alt = altText || alt || "";
    caption = captionText || caption;

    // Get the other attributes
    let attrs = this.convertAttributes(attributes, className);

    let div = `<div${attrs}>\n  ` +
          this.image(image, null, alt) +
          '\n' +
          this.caption(caption) +
          '</div>\n';
    return div;
  }

  caption(text, attributes) {
    let attrs = this.convertAttributes(attributes, "caption");
    return text ? `  <p${attrs}>${text}</p>\n` : '';
  }

  heading(text, level, raw, attributes) {
    let id;

    if (attributes && attributes.id) {
      id = attributes.id;
      delete attributes['id'];
    }
    else {
      id = this.options.headerPrefix + raw.toLowerCase().replace(/[^\w]+/g, '-');
    }

    let attrs = this.convertAttributes(attributes, this.getHeadingClass(level));

    return '<h'
      + level
      + `${attrs}`
      + ` id=${id}>`
      + text
      + '</h'
      + level
      + '>\n';
  }

  hr(attributes) {
    let attrs = this.convertAttributes(attributes);
    return `<hr${attrs}>\n`;
  }

  list(body, listType, start, attributes) {
    var typeTag, typeAttribute = '', startAttr = '';
    start = start.substr(0, start.length - 1);

    // Figure out the type of list, add some attributes
    switch (listType) {
      case 'bullet':
        typeTag = `ul`;
        break;
      case 'alphabetized':
        typeTag = `ol`
        typeAttribute = ` type="${start === start.toUpperCase() ? 'A' : 'a'}"`;
        startAttr = start.toUpperCase() === "A" ? '' : ` start="${ALPHABET.indexOf(start.toUpperCase()) + 1}"`;
        break;
      case 'definition':
        typeTag = `dl`;
        break;
      case 'numeral':
        typeTag = `ol`
        typeAttribute = ` type="${start === start.toUpperCase() ? 'I': 'i'}"`;
        startAttr = (start = decimalize(start) || 0) && start !== 1 ? ` start="${start}"` : '';
        break;
      case 'number':
        typeTag = `ol`;
        startAttr = start && start !== '1' ? ` start="${start}"` : '';
        break;
      default:
        typeTag = `ol`;
    }

    // Get the generic attributes for the list
    let genericAttrs = this.convertAttributes(attributes);

    return `<${typeTag}${typeAttribute}${startAttr}${genericAttrs}>\n${body}</${typeTag}>\n`;
  }

  definitionListItem(text, title, attributes) {
    let attrs = this.convertAttributes(attributes);
    return `<dt${attrs}>${title}</dt>\n<dd>${text}</dd>\n`;
  }

  listitem(text, attributes) {
    let attrs = this.convertAttributes(attributes);
    return `<li${attrs}>${text}</li>\n`;
  }

  paragraph(text, attributes) {
    text = text.replace(/\n/g, '<br/>\n');
    let attrs = this.convertAttributes(attributes);
    return `<p${attrs}>${text}</p>\n`;
  }

  table(header, body, attributes) {
    let attrs = this.convertAttributes(attributes);
    return `<table${attrs}>\n`
      + '<thead>\n'
      + header
      + '</thead>\n'
      + '<tbody>\n'
      + body
      + '</tbody>\n'
      + '</table>\n';
  }

  tablerow(content, attributes) {
    let attrs = this.convertAttributes(attributes);
    return `<tr${attrs}>\n${content}</tr>\n`;
  }

  tablecell(content, flags, attributes) {
    var type = flags.header ? 'th' : 'td';
    var tag = flags.align
      ? `<${type} style="text-align: ${flags.align}">`
      : `<${type}>`;
    return tag + content + '</' + type + '>\n';
  }

  // Cursor
  cursor() {
    return `<span id="__markuaCursorPosition__"></span>`
  }

  // span level renderer
  strong(text, attributes) {
    let attrs = this.convertAttributes(attributes);
    return `<strong${attrs}>${text}</strong>`;
  }

  em(text, attributes) {
    let attrs = this.convertAttributes(attributes);
    return `<em${attrs}>${text}</em>`;
  }

  codespan(text, attributes) {
    let attrs = this.convertAttributes(attributes);
    return `<code${attrs}>${text}</code>`;
  }

  br() {
    return '<br>';
  }

  del(text, attributes) {
    return `<del>${text}</del>`;
  }

  link(href, title, text, attributes) {
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
  }

  image(href, title, text, attributes) {
    if (!/http:|https:/.test(href))
      href = `images/${href}`;

    var out = `<img src="${href}" alt="${text}"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += '/>';
    return out;
  }
}

export default Renderer;
