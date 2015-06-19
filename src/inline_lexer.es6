import { inline, escape } from "./constants"
import Renderer from "./renderer"
let _ = require("underscore");

// Lexes and pipes tokens to the inline renderer
class InlineLexer {
  constructor(links, options) {
    this.options = options;
    this.links = links;
    this.rules = inline.normal;
    this.attributes = null;
    this.prevAttributes = null;
    this.renderer = new Renderer();

    if (!this.links)
      throw new Error('Tokens array requires a `links` property.');
  }

  // Exposed output function
  static output(src, links, options) {
    return new InlineLexer(links, options).output(src)
  }

  // lex and send tokens to the renderer
  output(src) {
    let cap, link, text, href, out = '';

    // Clear the attributes unless the last thing was an attribute
    if (!this.prevAttributes) this.attributes = null
    this.prevAttributes = null;

    while (src) {
      // escape
      if (cap = this.rules.escape.exec(src)) {
        src = src.substring(cap[0].length);
        out += cap[1];
        continue;
      }

      // autolink
      if (cap = this.rules.autolink.exec(src)) {
        src = src.substring(cap[0].length);
        if (cap[2] === '@') {
          text = cap[1].charAt(6) === ':'
            ? cap[1].substring(7)
            : cap[1];
          href = `mailto:${text}`;
        } else {
          text = escape(cap[1]);
          href = text;
        }
        out += this.renderer.link(href, null, text, this.attributes);
        continue;
      }

      // attributes
      if (cap = this.rules.attribute.inlineGroup.exec(src)) {
        // Since there could be text before the match (middle of a paragraph)
        // we need to cut the attributes out.
        let index = src.search(this.rules.attribute.inlineGroup);
        let length = cap[0].length

        src = _.string.splice(src, index - 1, cap[0].length + 1);

        let attributes = [];
        let pair;

        while ((pair = _.compact(this.rules.attribute.value.exec(cap[0]))).length) {
          attributes.push({ key: pair[1], value: pair[2] });
        }

        this.attributes = attributes;
        this.prevAttributes = true;
        continue;
      }


      // url (gfm)
      if (!this.inLink && (cap = this.rules.url.exec(src))) {
        src = src.substring(cap[0].length);
        text = escape(cap[1]);
        href = text;
        out += this.renderer.link(href, null, text, this.attributes);
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
      if ((cap = this.rules.reflink.exec(src))
          || (cap = this.rules.nolink.exec(src))) {
        src = src.substring(cap[0].length);
        link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
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
        out += this.renderer.strong(this.output(cap[2] || cap[1]), this.attributes);
        continue;
      }

      // em
      if (cap = this.rules.em.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.em(this.output(cap[2] || cap[1]), this.attributes);
        continue;
      }

      // code
      if (cap = this.rules.code.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.codespan(escape(cap[2], true), this.attributes);
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
        out += this.renderer.del(this.output(cap[1]), this.attributes);
        continue;
      }

      // text
      if (cap = this.rules.text.exec(src)) {
        src = src.substring(cap[0].length);
        out += escape(this.smartypants(cap[0]));
        continue;
      }

      if (src) {
        throw new
          Error('Infinite loop on byte: ' + src.charCodeAt(0));
      }
    }

    // We have attributes that we have to put on the previous element
    if (this.attributes)
      console.log("TODO: @bradens, need to attach attrs to the previous element")
    return out;
  }

  // Compile a link or Image
  outputLink(cap, link) {
    let href = escape(link.href),
        title = link.title ? escape(link.title) : null;

    return cap[0].charAt(0) !== '!'
      ? this.renderer.link(href, title, this.output(cap[1]), this.attributes)
      : this.renderer.image(href, title, escape(cap[1]), this.attributes);
  }

  // Turn dashes and stuff into special characters
  // -- SmartyPants
  smartypants(text) {
    return text
      // em-dashes
      .replace(/--/g, '\u2014')
      // opening singles
      .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
      // closing singles & apostrophes
      .replace(/'/g, '\u2019')
      // opening doubles
      .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
      // closing doubles
      .replace(/"/g, '\u201d')
      // ellipses
      .replace(/\.{3}/g, '\u2026');
  }
}

// Expose rules
InlineLexer.rules = inline

export default InlineLexer;
