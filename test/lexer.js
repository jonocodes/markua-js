var should = require("should")
var markua = require("../build/markua.js")

describe("Lexer", function() {
  it("Should have a lexer", function() { markua.should.have.property('lexer'); })
});
