import FileAccessor from "./file_accessor";

class WebFileAccessor extends FileAccessor {
  // Retrieves a file from our client side data (faked)
  get(filePath, cb) {
    let item = window.fileData[`${this.projectPath}/${filePath}`];
    cb(null, item);
  }

  // This is required for the code block imports, maybe do the file retrieval in an async method as a pre
  // or post processing step
  getSync(filePath) {
    return window.fileData[`${this.projectPath}/${filePath}`];
  }
}

export default WebFileAccessor;
