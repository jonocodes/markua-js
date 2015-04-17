var should = require("should")
var markua = require("../build/markua.js")

describe("Lexer", () => {
  it("Should have a lexer", () => { markua.should.have.property('lexer'); })
});
