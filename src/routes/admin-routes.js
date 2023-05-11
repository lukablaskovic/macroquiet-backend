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
  "/data/:name",
  [JWT.verifyToken, JWT.adminCheck],
  async (req, res) => {
    let db = await connect();
    let dataName = String(req.params.name);
    let filter = {};
    for (const [key, value] of Object.entries(req.query)) {
      filter[key] =
        value === "true"
          ? true
          : value === "false"
          ? false
          : isNaN(value)
          ? value
          : parseInt(value);
    }
    try {
      let cursor = await db.collection(dataName).find(filter);
      let result = await cursor.toArray();
      res.status(200).json(result);
    } catch (e) {
      res.status(400).json(e);
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
      res.status(400).send("Can't add users this way!");
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
      res.status(400).send({ "Bad Request!": e });
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
        res.status(400).send(e);
      }
    } else {
      res.status(400).send("No 'route' provided in body");
      return;
    }
  }
);
router.delete(
  "/data/:collectionName",
  [JWT.verifyToken, JWT.adminCheck],
  async (req, res) => {
    let collectionName = String(req.params.collectionName);

    let docID = req.query.id;

    let db = await connect();
    try {
      let result = await db
        .collection(collectionName)
        .deleteOne({ _id: new ObjectId(docID) });
      if (result) {
        res.status(202).send(docID);
      } else res.status(204).send("Document not found!");
    } catch (e) {
      throw new Error("Could not delete document!" + e);
    }
  }
);

export default router;
