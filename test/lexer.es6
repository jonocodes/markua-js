var should = require("should")
var markua = require("../build/markua.js")

describe("Lexer", () => {
  it("Should have a lexer", () => { markua.should.have.property('lexer'); })
  it("Should lex some tokens", () => {
    let src = `
    # My title
    ## My subtitle
    `
    console.log("Source is: ", src);
    console.log(markua.lexer.lex(src));
  })
});
