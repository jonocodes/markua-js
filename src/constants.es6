// Using some of the https://github.com/chjj/marked for a lot of the regexes
// Copyright (c) 2011-2014, Christopher Jeffrey (https://github.com/chjj/)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Need this polyfill for Object.assign for now...
let ObjectAssign = require("object-assign");

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
  heading: /^ *(#{1,6}) *([^\n]+) */,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: {
    body: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/u,
    definition: /^(?:(?:([^\n]*)(?:\n:(?: *))))/,
    number: /^([0-9]+)(?:\.)/,
    alphabetized: /^([\w]+)(?:[\)\.])/u,
    numeral: /^(?=[MDCLXVI])M*(?:C[MD]|D?C{0,3})(?:X[CL]|L?X{0,3})(I[XV]|V?I{0,3})(?:\)|\.)/i,
    bullet: /^\*/
  },
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|blockquote))+)\n*/,
  text: /^[^\n]+/,
  break: /^ *[\n]{2,}/,
  attribute: {
    group: /^(?:{)(?: *(?:("(?:[^\s"]|[ ])+")|('(?:[^\s']|[ ])+')|((?:[^\s])+))(?:: *)(?:("(?:[^\s"]|[ ])+")|('(?:[^\s']|[ ])+')|((?:[^\s])+)))(?:(?: *, *)(?: *(?:("(?:[^\s"]|[ ])+")|('(?:[^\s']|[ ])+')|((?:[^\s])+))(?:: *)(?:("(?:[^\s"]|[ ])+")|('(?:[^\s']|[ ])+')|((?:[^\s,])+))))*(?: *)(?:})/,
    value: /(?: *(?:("(?:[^\s"]|[ ])+")|('(?:[^\s']|[ ])+')|((?:[^\s,])+))(?:: *)(?:("(?:[^\s"]|[ ])+")|('(?:[^\s']|[ ])+')|((?:[^\s,])+)))/g
  },
  number: /([0-9]+)/
};

block.bullet = /(?:([*])|([\w\d ]+)(?:\.|\)|\n(?::)))/u;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/u;
block.item = replace(block.item, 'gm')(/bull/g, block.bullet)();

block.list.body = replace(block.list.body)(/bull/g, block.bullet)
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


/**
 * Renderer constants
 */

export let HEADING_BOOK_CLASS_MAP = {
   "1": "chapter",
   "2": "section",
   "3": "sub-section",
   "4": "sub-sub-section",
   "5": "sub-sub-sub-section",
   "6": "sub-sub-sub-sub-section"
 }

export let HEADING_MULTI_PART_CLASS_MAP = {
   "1": "part",
   "2": "chapter",
   "3": "section",
   "4": "sub-section",
   "5": "sub-sub-section",
   "6": "sub-sub-sub-section"
 }

export let HEADING_DOCUMENT_CLASS_MAP = {
   "1": "section",
   "2": "sub-section",
   "3": "sub-sub-section",
   "4": "sub-sub-sub-section",
   "5": "sub-sub-sub-sub-section",
   "6": "sub-sub-sub-sub-sub-section"
 }
