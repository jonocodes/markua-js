// Need this polyfill for Object.assign for now...
let ObjectAssign = require("object-assign")

let noop = () => {}
noop.exec = noop

export let escape = (html, encode) => {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export let unescape = (html) => {
  return html.replace(/&([#\w]+);/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
};

export let replace = (regex, opt) => {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
   if (!name) return new RegExp(regex, opt);
   val = val.source || val;
   val = val.replace(/(^|[^\[])\^/g, '$1');
   regex = regex.replace(name, val);
   return self;
  };
};

/**
 * Block level constants.  Mostly regexes to match what text to turn into
 * tokens during the lexing process
 */
export let block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|blockquote))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')(/bull/g, block.bullet)();

block.list = replace(block.list)(/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', `\\n+(?=${block.def.source})`)
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block.paragraph = replace(block.paragraph)
  ('heading', block.heading)
  ('blockquote', block.blockquote)
  ();

block.normal = ObjectAssign({}, block);

/**
 * Inline level constants
 */
export let inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
 ('inside', inline._inside)
 ('href', inline._href)
 ();

inline.reflink = replace(inline.reflink)
 ('inside', inline._inside)
 ();

/**
* Normal Inline Grammar
*/
inline.normal = ObjectAssign({}, inline);


/**
* GFM Inline Grammar
*/

inline.gfm = ObjectAssign({}, inline.normal, {
 escape: replace(inline.escape)('])', '~|])')(),
 url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
 del: /^~~(?=\S)([\s\S]*?\S)~~/,
 text: replace(inline.text)
   (']|', '~]|')
   ('|', '|https?://|')
   ()
});

/**
* GFM + Line Breaks Inline Grammar
*/
inline.breaks = ObjectAssign({}, inline.gfm, {
 br: replace(inline.br)('{2,}', '*')(),
 text: replace(inline.gfm.text)('{2,}', '*')()
});
