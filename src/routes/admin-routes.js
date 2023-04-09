import { Router } from "express";
import connect from "../../services/mongoClient.js";
import { ObjectId } from "mongodb";

const router = Router();

let fetchData = async (req, res) => {
  let db = await connect();
  let dataName = String(req.params.name);
  try {
    let cursor = await db.collection(dataName).find();
    let result = await cursor.toArray();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json(e);
  }
};

let insertDocument = async (req, res) => {
  let collectionName = String(req.params.name);
  let doc = req.body;
  let db = await connect();
  try {
    let result = await db.collection(collectionName).insertOne(doc);
    if (result && result.insertedId) {
      console.log(
        `Document with an ID: ${result.insertedId} has been sucessfuly inserted!`
      );
      res.status(201).send(result.insertedId);
    }
  } catch (e) {
    throw new Error("Could not insert document!");
  }
};

let deleteDocument = async (req, res) => {
  let collectionName = String(req.params.name);
  let docID = req.query.id;

  let db = await connect();
  try {
    let result = await db
      .collection(collectionName)
      .deleteOne({ _id: new ObjectId(docID) });
    if (result) {
      console.log(
        `Document with an ID ${docID} has been successfully deleted!`
      );
      res.status(202).send(docID);
    } else res.status(204).send("Document not found!");
  } catch (e) {
    throw new Error("Could not delete document!" + e);
  }
};

export default {
  fetchData,
  insertDocument,
  deleteDocument,
};
