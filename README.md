# Markua-js
### A javascript implementation for the [markua specification](https://markua.com)

Many thanks to the authors of [marked](https://github.com/chjj/marked), from which
a large amount of the regexes were taken.

#### About
Markua-js is a javascript implementation of the [Markua Specification](http://leanpub.com/markua)

Markua-js is written in ES6 (The new version of ECMAScript) which means that to
actually run it, we make use of [Babel](http://babeljs.io) for cross compiling down
to ES5 so we con properly run it in almost all browsers, and through stable versions
of [nodejs](http://nodejs.org).


#### Installation

* `npm install`
* `gulp build-js`


#### Running

Run the markua executable by running `./markua`, symlink it to somewhere like
`usr/local/bin` for ease of use.

TODO: installation for web projects