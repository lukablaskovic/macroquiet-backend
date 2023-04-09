import { Router } from "express";
import multer from "multer";
import S3Client from "../../services/S3Client";

// /api/file
const router = Router();

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
upload.single("avatar");

router.get("/", async (req, res) => {
  res.status(200);
});

router.post("/", upload.single("image"), async (req, res) => {
  console.log("test");
  const params = {
    Bucket: BUCKET_NAME,
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };
  const command = new S3Client.PutObjectCommand(params);
  await S3Client.S3.send(command);
  console.log("req.body", req.body);
  console.log("req.file", req.file);
  //Actual image - req.file.buffer

  res.send({});
});

export default router;
