class FileAccessor {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }
  get(path) {
    console.log("Override me!");
  }
}

export default FileAccessor;
