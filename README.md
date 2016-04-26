# Markua-js

## Warning: This is an alpha build, and should be used with extreme caution. Everything could change.

### A javascript implementation for the [Markua specification](http://markua.com)

Many thanks to the authors of [marked](https://github.com/chjj/marked), from which
a large amount of the regexes were taken.

#### About
Markua-js is a javascript implementation of the [Markua Specification](http://leanpub.com/markua)

Markua-js is written in ES6 (The new version of ECMAScript) which means that to
actually run it, we make use of [Babel](http://babeljs.io) for cross compiling down
to ES5 so we can properly run it in almost all browsers, and through stable versions
of [nodejs](http://nodejs.org).


#### Installation

* `npm install`
* `gulp`

#### Running

Run the markua executable by running `./markua`, symlink it to somewhere like
`usr/local/bin` for ease of use.

You may try passing in stdin like to see the raw markua -> html conversion:

`echo '# Heading 1' | ./markua`

or you can run it against a directory (correctly organized to the Markua standard, see [/data/test_book](https://github.com/markuadoc/markua-js/tree/master/data/test_book)) like this:

`./markua /path/to/directory`


#### TODO
See the issues list [here](https://github.com/markuadoc/markua-js/issues)