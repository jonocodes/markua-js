'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

var characterIsNext = function characterIsNext(character, previous) {
  return ALPHABET[ALPHABET.indexOf(character) - 1] === previous;
};
exports.characterIsNext = characterIsNext;