'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
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
var ObjectAssign = require('object-assign');

var noop = function noop() {};
noop.exec = noop;

var escape = function escape(html, encode) {
  return html.replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

exports.escape = escape;
var unescape = function unescape(html) {
  return html.replace(/&([#\w]+);/g, function (_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x' ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
};

exports.unescape = unescape;
var replace = function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) {
      return new RegExp(regex, opt);
    }val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
};

exports.replace = replace;
/**
 * Block level constants.  Mostly regexes to match what text to turn into
 * tokens during the lexing process
 */
var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+) */,
  //heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|blockquote))+)\n*/,
  text: /^[^\n]+/,
  twonewlines: /^ *[\n]{2,}/
};

exports.block = block;
block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')(/bull/g, block.bullet)();

block.list = replace(block.list)(/bull/g, block.bullet)('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')('def', '\\n+(?=' + block.def.source + ')')();

block.blockquote = replace(block.blockquote)('def', block.def)();

block.paragraph = replace(block.paragraph)('heading', block.heading)('blockquote', block.blockquote)();

block.normal = ObjectAssign({}, block);

/**
 * Inline level constants
 */
var inline = {
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

exports.inline = inline;
inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)('inside', inline._inside)('href', inline._href)();

inline.reflink = replace(inline.reflink)('inside', inline._inside)();

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
  text: replace(inline.text)(']|', '~]|')('|', '|https?://|')()
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

var HEADING_BOOK_CLASS_MAP = {
  '1': 'chapter',
  '2': 'section',
  '3': 'sub-section',
  '4': 'sub-sub-section',
  '5': 'sub-sub-sub-section',
  '6': 'sub-sub-sub-sub-section'
};

exports.HEADING_BOOK_CLASS_MAP = HEADING_BOOK_CLASS_MAP;
var HEADING_MULTI_PART_CLASS_MAP = {
  '1': 'part',
  '2': 'chapter',
  '3': 'section',
  '4': 'sub-section',
  '5': 'sub-sub-section',
  '6': 'sub-sub-sub-section'
};

exports.HEADING_MULTI_PART_CLASS_MAP = HEADING_MULTI_PART_CLASS_MAP;
var HEADING_DOCUMENT_CLASS_MAP = {
  '1': 'section',
  '2': 'sub-section',
  '3': 'sub-sub-section',
  '4': 'sub-sub-sub-section',
  '5': 'sub-sub-sub-sub-section',
  '6': 'sub-sub-sub-sub-sub-section'
};
exports.HEADING_DOCUMENT_CLASS_MAP = HEADING_DOCUMENT_CLASS_MAP;