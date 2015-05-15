'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

exports.ALPHABET = ALPHABET;
var characterIsNext = function characterIsNext(character, previous) {
  return ALPHABET[ALPHABET.indexOf(character) - 1] === previous;
};

exports.characterIsNext = characterIsNext;
var romanize = function romanize(decimalNumber) {
  var num = Math.floor(decimalNumber),
      val,
      s = '',
      i = 0,
      v = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1],
      r = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  if (this - num || num < 1) num = 0;
  while (num) {
    val = v[i];
    while (num >= val) {
      num -= val;
      s += r[i];
    }
    ++i;
  }
  return s;
};

exports.romanize = romanize;
var decimalize = function decimalize(romanNumeral) {
  var s = romanNumeral.toUpperCase().replace(/ +/g, ''),
      L = s.length,
      sum = 0,
      i = 0,
      next,
      val,
      R = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 };
  if (/^[MDCLXVI)(]+$/.test(s)) {
    while (i < L) {
      val = R[s.charAt(i++)];
      next = R[s.charAt(i)] || 0;

      if (next - val > 0) val *= -1;
      sum += val;
    }
    return sum;
  }
  return NaN;
};
exports.decimalize = decimalize;