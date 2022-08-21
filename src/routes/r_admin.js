import connect from "../db.js";
import { ObjectId } from "mongodb";

let addNewTimelinePost = async (req, res) => {
  let db = await connect();

  let postData = req.body;
  let doc = {
    title: postData.title,
    text: postData.text,
    author: postData.author,
    icon: postData.icon,
    image: postData.image,
    date: postData.date,
  };
  try {
    let result = await db.collection("timeline").insertOne(doc);
    if (result && result.insertedId) {
      console.log("Post with ID" + result.insertedId + "sucessfuly inserted");
      res.json("Post with ID" + result.insertedId + "sucessfuly inserted");
      return result.insertedId;
    }
  } catch (e) {
    console.log(e);
  }
};
let addNewGamePost = async (req, res) => {
  let db = await connect();

  let postData = req.body;
  let doc = {
    title: postData.title,
    text: postData.text,
    availability: postData.availability,
    imageSrc: postData.imageSrc,
    gName: postData.gName,
  };
  console.log(doc);
  try {
    let result = await db.collection("gameCards").insertOne(doc);
    if (result && result.insertedId) {
      console.log(
        "Game Post with ID" + result.insertedId + "sucessfuly inserted"
      );
      res.json("Game Post with ID" + result.insertedId + "sucessfuly inserted");
      return result.insertedId;
    }
  } catch (e) {
    console.log(e);
  }
};
let deleteTimelinePost = async (req, res) => {
  let db = await connect();
  console.log(query);

  let query = String(req.query.id);
  try {
    let result = await db
      .collection("timeline")
      .deleteOne({ _id: new ObjectId(query) });
    if (result) {
      console.log("Post with ID" + req.query.id + "successfully deleted");
      res.status(200).send("Post deleted successfuly!");
    }
  } catch (e) {
    console.log(e);
    throw new Error("Could not delete post!");
  }
};
let fetchData = async (req, res) => {
  let db = await connect();
  let dataName = String(req.query.d);
  let cursor = await db.collection(dataName).find();
  let results = await cursor.toArray();
  res.json(results);
};
export default {
  addNewTimelinePost,
  addNewGamePost,
  deleteTimelinePost,
  fetchData,
};
