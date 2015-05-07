import FileAccessor from "./file_accessor"

class WebFileAccessor extends FileAccessor {
  // Retrieves a file from our client side data (faked)
  get(filePath, cb) {
    let item = window.fileData[`${this.projectPath}/${filePath}`];
    cb(null, item);
  }
};

export default WebFileAccessor;
