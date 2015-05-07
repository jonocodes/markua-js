import Markua from "./markua"
import WebFileAccessor from "./web_file_accessor"

if (typeof window !== 'undefined')
  window.markua = new Markua("/data/test_book", { fileAccessor: WebFileAccessor });
