import express from "express";
import multer from "multer";
import cors from "cors";

import S3Client from "./S3Client";

const BUCKET_NAME = process.env.BUCKET_NAME;

const app = express();
app.use(cors());
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

upload.single("avatar");

app.get("/api/posts", async (req, res) => {
  console.log("It's working...");
  res.send({});
});

app.post("/api/posts", upload.single("image"), async (req, res) => {
  console.log("req.body", req.body);
  console.log("req.file", req.file);
  //Actual image - req.file.buffer
  const params = {
    Bucket: BUCKET_NAME,
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };
  const command = new S3Client.PutObjectCommand(params);
  await S3Client.S3.send(command);
  res.send({});
});

app.listen(8080, () => console.log("Listening on port 8080"));
