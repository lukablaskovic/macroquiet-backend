import { Router } from "express";
import connect from "../services/mongoClient.js";
import { ObjectId } from "mongodb";
import JWT from "../services/JWT.js";
import multer from "multer";
import S3Client from "../services/S3Client.js";

//import sharp from "sharp";
import crypto from "crypto";

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
upload.single("avatar");

// --> /api/admin
const router = Router();

//Get collection
router.get(
  "/data/:collectionName/:id?",
  [JWT.verifyToken, JWT.adminCheck],
  async (req, res) => {
    try {
      let db = await connect();
      let collectionName = String(req.params.collectionName);
      let id = req.params.id;
      let filter = {};

      // check if id is provided
      if (id) {
        // check if id is a string of 12 or 24 hex characters or an integer
        if (
          ObjectId.isValid(id) &&
          (id.length === 12 || id.length === 24 || !isNaN(id))
        ) {
          filter._id = new ObjectId(id);
        } else {
          return res.status(400).json({ error: "Invalid ID format." });
        }
      } else if (Object.keys(req.query).length) {
        // if filter is provided in query params, filter by that filter
        for (const [key, value] of Object.entries(req.query)) {
          filter[key] =
            value === "true" ? true : value === "false" ? false : value;
        }
      }
      console.log(filter);
      // if no id or filter, the whole collection will be returned
      let cursor = await db.collection(collectionName).find(filter);
      let result = await cursor.toArray();

      return res.status(200).json(result);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  }
);

//Insert new document
router.post(
  "/data/:collectionName",
  [JWT.verifyToken, JWT.adminCheck],
  async (req, res) => {
    let collectionName = String(req.params.collectionName);

    if (collectionName == "users") {
      res.status(400).json({ error: "Can't add users this way!" });
      return;
    }

    let doc = req.body;
    let db = await connect();
    try {
      let result = await db.collection(collectionName).insertOne(doc);
      if (result && result.insertedId) {
        res.status(201).send(result.insertedId);
      }
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }
);

//Update the fileds of a document
router.patch(
  "/data/:collectionName/:id",
  [JWT.verifyToken, JWT.adminCheck],
  async (req, res) => {
    let collectionName = String(req.params.collectionName);
    let id = req.params.id;
    let doc = req.body;

    // check if id is provided
    if (id) {
      // check if id is a string of 12 or 24 hex characters or an integer
      if (
        ObjectId.isValid(id) &&
        (id.length === 12 || id.length === 24 || !isNaN(id))
      ) {
        try {
          let db = await connect();
          if (!doc) {
            res
              .status(400)
              .json({ error: "No document data provided in body!" });
            return;
          }
          let document_id = new ObjectId(id);
          let result = await db
            .collection(collectionName)
            .updateOne(
              { _id: document_id },
              { $set: { ...doc, _id: document_id } }
            );
          if (result) res.status(204).json({ message: "Success" });
        } catch (e) {
          res.status(400).json({ error: "Error updating document!" + e });
        }
      } else {
        return res.status(400).json({ error: "Invalid ID format." });
      }
    }
  }
);

//Replace the whole document with different doc object
router.put(
  "/data/:collectionName/:id",
  [JWT.verifyToken, JWT.adminCheck],
  async (req, res) => {
    let collectionName = String(req.params.collectionName);
    let id = req.params.id;
    let doc = req.body;

    // check if id is provided
    if (id) {
      // check if id is a string of 12 or 24 hex characters or an integer
      if (
        ObjectId.isValid(id) &&
        (id.length === 12 || id.length === 24 || !isNaN(id))
      ) {
        try {
          let db = await connect();
          if (!doc) {
            return res
              .status(400)
              .json({ "Bad Request!": "No document data provided in body!" });
          }
          let document_id = new ObjectId(id);
          let result = await db
            .collection(collectionName)
            .replaceOne({ _id: document_id }, doc);

          if (result.modifiedCount > 0) {
            res.status(204).send("Success");
          } else {
            res.status(404).json({ "Document not found!": document_id });
          }
        } catch (e) {
          res.status(400).json({ "Error replacing document!": e });
        }
      } else {
        return res.status(400).json({ error: "Invalid ID format." });
      }
    }
  }
);

router.delete(
  "/data/:collectionName/:id?",
  [JWT.verifyToken, JWT.adminCheck],
  async (req, res) => {
    let collectionName = String(req.params.collectionName);
    let id = req.params.id;
    let filter = {};

    if (!id && Object.keys(req.query).length === 0) {
      // Delete the entire collection
      try {
        let db = await connect();
        let result = await db.collection(collectionName).deleteMany({});
        if (result.deletedCount > 0) {
          res
            .status(202)
            .json({ message: `${result.deletedCount} document(s) deleted` });
        } else {
          res.status(404).json({ error: "Collection not found or empty!" });
        }
      } catch (e) {
        res.status(400).json({ error: "Could not delete collection! " + e });
      }
    } else if (id) {
      if (
        ObjectId.isValid(id) &&
        (id.length === 12 || id.length === 24 || !isNaN(id))
      ) {
        // Delete a specific document
        try {
          let db = await connect();
          let result = await db
            .collection(collectionName)
            .deleteOne({ _id: new ObjectId(id) });
          if (result.deletedCount > 0) {
            res.status(202).send(result.deletedCount + " document(s) deleted");
          } else {
            res.status(404).json({ error: "Document not found!" });
          }
        } catch (e) {
          res.status(400).json({ error: "Could not delete document! " + e });
        }
      } else {
        return res.status(400).json({ error: "Invalid ID format." });
      }
    } else {
      // Delete filtered documents
      for (const [key, value] of Object.entries(req.query)) {
        filter[key] =
          value === "true" ? true : value === "false" ? false : value;
      }
      try {
        let db = await connect();
        let result = await db.collection(collectionName).deleteMany(filter);
        if (result.deletedCount > 0) {
          res.status(202).send(result.deletedCount + " document(s) deleted");
        } else {
          res.status(404).json({ error: "No matching documents found!" });
        }
      } catch (e) {
        res.status(400).json({ error: "Could not delete documents! " + e });
      }
    }
  }
);

//Upload new image
const allowedRoutesForUpload = Array.of("carousel");
router.post(
  "/image",
  [JWT.verifyToken, JWT.adminCheck, upload.single("image")],
  async (req, res) => {
    let providedRoute = String(req.body.route);

    if (allowedRoutesForUpload.includes(providedRoute)) {
      try {
        const imageName = randomImageName();

        const params = {
          Bucket: BUCKET_NAME,
          Key: `${String(providedRoute)}/${imageName}`,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        let command = new S3Client.PutObjectCommand(params);
        await S3Client.S3.send(command);

        let publicURL = `https://${BUCKET_NAME}.s3.amazonaws.com/${params.Key}`;
        res.status(201).json({ public_url: publicURL });
      } catch (e) {
        res.status(400).json({ error: "Bad request!" });
      }
    } else {
      res.status(400).json({ error: "No 'route' provided in body" });
      return;
    }
  }
);

export default router;
