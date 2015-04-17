var should = require("should")
var markua = require("../build/markua.js")

describe("Parser", () => {
  it("Should have a parser", () => { markua.should.have.property('parser'); })
});
