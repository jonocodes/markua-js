// Need this polyfill for Object.assign for now...
let ObjectAssign = require("object-assign")

let noop = () => {}
noop.exec = noop

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
}

/**
 * Block level constants.  Mostly regexes to match what text to turn into
 * tokens during the lexing process
 */

export let block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  nptable: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
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

block.gfm = ObjectAssign({}, block.normal, {
  fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/
});

block.gfm.paragraph = replace(block.paragraph)('(?!', '(?!'
     + block.gfm.fences.source.replace('\\1', '\\2') + '|'
     + block.list.source.replace('\\1', '\\3') + '|')();

block.tables = ObjectAssign({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});
