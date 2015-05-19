let Markua = require("./build/markua");
let markua = new Markua(process.argv[2] || "./data/test_book", { debug: false });
markua.run((error, bookHtml) => {
  process.stdout.write(bookHtml);
});
