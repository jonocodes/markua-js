import { block } from "./constants";
import { characterIsNext, decimalize } from "./util";
let _ = require("underscore");

// Class for lexing block elements of markua
class Lexer {
  constructor(options = {}) {
    this.tokens = [];
    this.tokens.links = {};
    this.options = options;
    this.rules = block.normal;
    this.warnings = [];
  }

  static lex(src, options) {
    let lexer = new Lexer(options);
    return lexer.lex(src);
  }

  lex(src) {
    // Preprocess
    src = src
      .replace(/\r\n|\r/g, '\n')
      .replace(/\t/g, '    ')
      .replace(/\u00a0/g, ' ')
      .replace(/\u2424/g, '\n');

    // Go go go
    return this.token(src, true);
  }

  token(src, top, list) {
    let cap;
    src = src.replace(/^ +$/gm, '');

    while(src) {
      // newline
      // jshint boss:true
      if (cap = this.rules.newline.exec(src)) {
        src = src.substring(cap[0].length);
        if (cap[0].length > 1)
          this.tokens.push({ type: 'space' });
      }

      // attribute
      if (cap = this.rules.attribute.group.exec(src)) {
        src = src.substring(cap[0].length);

        let attributes = [];
        let pair;

        while ((pair = _.compact(this.rules.attribute.value.exec(cap[0]))).length) {
          attributes.push({ key: pair[1], value: pair[2] });
        }

        this.tokens.push({
          type: 'attribute',
          attributes: attributes
        });
        continue;
      }

      // Figure
      if (cap = this.rules.figure.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'figure',
          alt: cap[2],
          image: cap[3],
          caption: cap[4]
        });
      }

      // fences (gfm)
      if (cap = this.rules.fences.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'code',
          lang: cap[2],
          text: cap[3]
        });
        continue;
      }

      // heading
      if (cap = this.rules.heading.exec(src)){
        src = src.substring(cap[0].length);

        // Check to make sure there is another newline under this thing
        if (!this.rules.break.exec(src)) {
          this.warnings.push(`Must be a newline after ${cap[0]}`);
        }

        this.tokens.push({
          type: 'heading',
          depth: cap[1].length,
          text: cap[2]
        });
        continue;
      }

      // table no leading pipe (gfm)
      if (top && (cap = this.rules.nptable.exec(src))) {
        src = src.substring(cap[0].length);
        let item = {
          type: 'table',
          header: cap[1].replace(/^ *| *\| *$/g, '').split(RegExp(' *\\| *')),
          align: cap[2].replace(/^ *|\| *$/g, '').split(RegExp(' *\\| *')),
          cells: cap[3].replace(/\n$/, '').split('\n')
        };

        for (let i = 0; i < item.align.length; i++) {
          if (/^ *-+: *$/.test(item.align[i])){
            item.align[i] = 'right';
          }
          else if (/^ *:-+: *$/.test(item.align[i])){
            item.align[i] = 'center';
          }
          else if (/^ *:-+ *$/.test(item.align[i])) {
            item.align[i] = 'left';
          }
          else {
            item.align[i] = null;
          }
        }

        for (let i = 0; i < item.cells.length; i++) {
          item.cells[i] = item.cells[i].split(RegExp(' *\\| *'));
        }

        this.tokens.push(item);
        continue;
      }

      // hr
      if (cap = this.rules.hr.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({ type: 'hr' });
        continue;
      }

      // aside
      if (cap = this.rules.aside.exec(src)) {
        src = src.substring(cap[0].length);

        this.tokens.push({ type: 'aside_start' });

        cap = cap[0].replace(/^ *A> ?/gm, '');

        // Pass `top` to keep the current
        // "toplevel" state. This is exactly
        // how markdown.pl works.
        this.token(cap, top, true);
        this.tokens.push({ type: 'aside_end' });
        continue;
      }

      // blockquote
      if (cap = this.rules.blockquote.exec(src)) {
        src = src.substring(cap[0].length);

        this.tokens.push({ type: 'blockquote_start' });

        cap = cap[0].replace(/^ *> ?/gm, '');

        // Pass `top` to keep the current
        // "toplevel" state. This is exactly
        // how markdown.pl works.
        this.token(cap, top, true);
        this.tokens.push({ type: 'blockquote_end' });
        continue;
      }

      // Code import
      if (cap = this.rules.codeimport.exec(src)) {
        src = src.substring(cap[0].length);
        let fileWithoutExt = cap[1],
            ext = cap[2];

        // Read the file, output a codeblock with that file's language
        let file = ext ? `${fileWithoutExt}.${ext}` : fileWithoutExt

        let code = this.options.fileAccessor.getSync(`code/${file}`);

        this.tokens.push({
          type: 'code',
          lang: cap[2] || "text",
          text: code
        });
        continue;
      }

      // list
      if (cap = this.rules.list.body.exec(src)) {
        src = src.substring(cap[0].length);
        let bull = cap[2], listType;

        // Determine what number the list will start with -- if it's a numbered
        // list
        if (this.rules.list.number.exec(bull))
          listType = "number";
        else if (this.rules.list.numeral.exec(bull))
          listType = "numeral";
        else if (this.rules.list.alphabetized.exec(bull))
          listType = "alphabetized";
        else if (this.rules.list.bullet.exec(bull))
          listType = "bullet";
        else if (this.rules.list.definition.exec(bull))
          listType = "definition";
        else {
          this.warnings.push(`Undefined list type for ${src}`);
          continue;
        }

        this.tokens.push({
          type: 'list_start',
          listType: listType,
          start: bull
        });

        // Get each top-level item.
        cap = cap[0].match(this.rules.item);

        var prevIndex = null,
            next = false,
            l = cap.length,
            definitionTitle = null;

        for (let i = 0; i < l;i++) {
          let item = cap[i];

          // If the list order matters, and we aren't at the start, ensure that
          // the current index is one greater than the previous
          let currentIndex = (() => {
            let current, matches;
            warning = `List indices should be consecutive, automatically increasing near ${cap[0]}`;
            switch (listType) {
              case 'number':
                current = (this.rules.list.number.exec(item) && parseInt(this.rules.list.number.exec(item)[1])) || null;

                // Warn for numeric lists
                if (prevIndex !== null && current !== 1 + prevIndex)
                  this.warnings.push(warning);

                return current;
              case 'alphabetized':
                current = (this.rules.list.alphabetized.exec(item) && this.rules.list.alphabetized.exec(item)[1]) || null;

                // Warn for alpha list
                if (prevIndex !== null && !characterIsNext(current, prevIndex))
                  this.warnings.push(warning);

                return current;
              case 'numeral':
                current = (this.rules.list.numeral.exec(item) && this.rules.list.numeral.exec(item)[2]) || null;
                if (current) bull = current = current.substr(0, current.length-1);

                // Warn for roman numerals
                if (prevIndex && decimalize(current) !== decimalize(prevIndex) + 1)
                  this.warnings.push(warning);

                return current;
              case 'bullet':
                return true;
              case 'definition':
                definitionTitle = item.match(this.rules.bullet)[3];
                return true;
            }
          })();

          if (!currentIndex) {
            this.warnings.push(`Invalid list item at ${item}`);
            continue;
          }

          // Remove the list item's bullet
          // so it is seen as the next token.
          let space = item.length;
          item = item.replace(this.rules.bullet, '');

          // Outdent whatever the
          // list item contains. Hacky.
          if (~item.indexOf('\n ')) {
            space -= item.length;
            item = item.replace(/^ {1,4}/gm, '');
          }

          this.tokens.push({ type: 'list_item_start', listType: listType, bullet: listType === 'definition' ? definitionTitle : bull });

          // Recurse.
          this.token(item, false, true);
          this.tokens.push({ type: 'list_item_end' });
          prevIndex = currentIndex;
        }
        this.tokens.push({ type: 'list_end' });
        continue;
      }

      // def
      if (!list && top && (cap = this.rules.def.exec(src))) {
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
        let item = {
          type: 'table',
          header: cap[1].replace(/^ *| *\| *$/g, '').split(RegExp(' *\\| *')),
          align: cap[2].replace(/^ *|\| *$/g, '').split(RegExp(' *\\| *')),
          cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
        };

        for (let i = 0; i < item.align.length; i++) {
          if (/^ *-+: *$/.test(item.align[i]))
            item.align[i] = 'right';
          else if (/^ *:-+: *$/.test(item.align[i]))
            item.align[i] = 'center';
          else if (/^ *:-+ *$/.test(item.align[i]))
            item.align[i] = 'left';
          else
            item.align[i] = null;
        }

        for (let i = 0; i < item.cells.length; i++) {
          item.cells[i] = item.cells[i].replace(/^ *\| *| *\| *$/g, '').split(RegExp(' *\\| *'));
        }

        this.tokens.push(item);
        continue;
      }

      // top-level paragraph
      if (top && (cap = this.rules.paragraph.exec(src))) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'paragraph',
          text: cap[1].charAt(cap[1].length - 1) == '\n' ? cap[1].slice(0, -1) : cap[1]
        });
        continue;
      }

      // text
      // FIXME: These should insert break tags where there are newlines when we are in
      // a list. See https://dashcube.com/app/m/1343038
      if (cap = this.rules.text.exec(src)) {
        // Top-level should never reach here.
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'text',
          text: cap[0]
        });
        continue;
      }

      if (src)
        throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }

    if (this.options.debug) {
      for (var warning of this.warnings) {
        console.warn(warning);
      }
      this.warnings = [];
    }

    return this.tokens;
  }
}

export default Lexer;
