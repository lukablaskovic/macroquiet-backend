import fs from "fs";
import path from "path";
import connect from "../db.js";

import "dotenv/config";
import { Schema, model } from 'mongoose';

// Model used for uploading
var imageSchema = new Schema({
    name: { type: String, require: false, index: true, unique: false, sparse: true},
    desc: { type: String, require: false, index: true, unique: false, sparse: true},
    img:
    {
        data: Buffer,
        contentType: String
    }
});
   
var imgModel = new model('Image', imageSchema);

var multer = require("multer"); //Multer is nodejs middleware used for uploading files.

var storage = multer.diskStorage({
  destination: './src/routes/uploads',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var imageUpload = multer({ storage: storage });
 
let upload = async (req, res) => { 
  let localPath = path.join(
    __dirname + "/uploads/" + req.body.name
  );
  var obj = {
    name: req.body.name,
    desc: req.body.desc,
    img: {
      data: fs.readFileSync(localPath),
      contentType: "image/png",
    },
  };

  imgModel.create(obj, (err, item) => {
    if (err) {
        res.status(400).json({ error: "Upload error: " + e });
    } else {
        item.save();
        let data = item;
        fs.unlink(localPath, (err) => {
        if (err) throw err;
        });
        res
        .status(201)
        .send(
            "Image { " +
            data.name +
            " } with id { " +
            data._id +
            " } succesfully uploaded!"
        );
    }
  });
};

let download = async (req, res) => {
  let db = await connect();
  try {
    let image = await db.collection("images").findOne({ name: "UserTrophy" });

    res
    .status(201)
    .send(image);
  } catch (e) {
    res.status(400).json({ error: "Download error: " + e });
  }
}

export default { imageUpload, upload, download };