import connect from "../db.js";

import "dotenv/config";
import Image from "./image.js";
 
let upload = async (req, res) => { 
  let {name, desc, img} = req.body;  
  let image = new Image({
        name,
        desc,
        img
  })
  try {
    let newImage = await image.save();
    let response = "Succesfully uploaded image { "+ newImage.name +" } with id { " + newImage._id +" }";
    console.log(response);
    res.status(201).send(response); 
  }
  catch (e) {
    res.status(500).json({ error: e.message });
  }
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

export default { upload, download };