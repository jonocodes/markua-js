import FileAccessor from "./file_accessor";
var fs, path = require("path");

try {
  fs = require("fs");
} catch(err) {
  console.log("fs is not available in this env");
}

class NativeFileAccessor extends FileAccessor {
  // Override
  get(filePath, cb) {
    fs.readFile(filePath, { encoding: "utf8" }, function(error, contents) {
      if (error) return cb(error);
      cb(null, contents);
    });
  }

  // This is required for the code block imports, maybe do the file retrieval in an async method as a pre
  // or post processing step
  getSync(filePath) {
    return fs.readFileSync(filePath, { encoding: "utf8" }).toString();
  }
}

export default NativeFileAccessor;
