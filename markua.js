let fs = require("fs");
let Markua = require("./build/markua");
let markua = new Markua(process.argv[2], { debug: false });

let out = (error, bookHtml) => {
  process.stdout.write(bookHtml);
};

fs.exists(process.argv[2], (exists) => {
  if (exists) {
    markua.run(out);
  } else {
    markua.runSource(process.argv[2], out);
  }
})
