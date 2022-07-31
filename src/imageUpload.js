//STORING IMAGES

import mongoose from "mongoose"; //Mongoose is a MongoDB client library providing object-modelling for use in an asynchronous environment. Mongoose supports both promises and callbacks.

import "dotenv/config";
import connect from "./db.js";
import express from "express";
const app = express();
/*
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
    console.log('connected');
}); 
*/

var multer = require("multer"); //Multer is nodejs middleware used for uploading files.

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var upload = multer({ storage: storage });

export default upload;
