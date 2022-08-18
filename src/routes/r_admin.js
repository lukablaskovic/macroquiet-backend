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
  console.log(doc);
  try {
    let result = await db.collection("timeline").insertOne(doc);
    if (result && result.insertedId) {
      res.json("Post with ID" + result.insertedId + "sucessfuly inserted");
      return result.insertedId;
    }
  } catch (e) {
    console.log(e);
  }
};
let deleteTimelinePost = async (req, res) => {
  let db = await connect();
  let query = String(req.query.id);
  try {
    let result = await db
      .collection("timeline")
      .deleteOne({ _id: new ObjectId(query) });
    if (result) {
      res.status(200).send("Post deleted successfuly!");
    }
  } catch (e) {
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
export default { addNewTimelinePost, deleteTimelinePost, fetchData };
