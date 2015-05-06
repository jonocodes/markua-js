import FileAccessor from "./file_accessor";
var fs = require("fs"),
    path = require("path");

class NativeFileAccessor extends FileAccessor {
  // Override
  get(filePath, cb) {
    console.log(`[NativeFileAccessor] Accessing file ${path.join(this.projectPath, filePath)}`);
    fs.readFile(path.join(this.projectPath, filePath), { encoding: "utf8" }, function(error, contents) {
      if (error) return cb(error)
      cb(null, contents)
    })
  }
}

export default NativeFileAccessor
