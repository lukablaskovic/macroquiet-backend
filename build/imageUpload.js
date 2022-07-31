"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var multer = require('multer'); //Multer is nodejs middleware used for uploading files.


var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function filename(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});
var upload = multer({
  storage: storage
});
var _default = {
  upload: upload
};
exports["default"] = _default;