import FileAccessor from "./file_accessor";

class WebFileAccessor extends FileAccessor {
  getFilePrefix(type) {
    if (type === "code")
      return `${this.projectPath}/code`;
    else
      return this.projectPath;
  }

  // Retrieves a file from our client side data (faked)
  get(filePath, cb, type = "manuscript") {
    let item = window.fileData[`${this.getFilePrefix(type)}/${filePath}`];
    cb(null, item);
  }

  // This is required for the code block imports, maybe do the file retrieval in an async method as a pre
  // or post processing step
  getSync(filePath, type = "manuscript") {
    return window.fileData[`${this.getFilePrefix(type)}/${filePath}`];
  }
}

export default WebFileAccessor;
