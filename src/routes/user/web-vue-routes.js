import { Router } from "express";
import mdw from "../../middlewares";

import connect from "../../../services/mongoClient.js";

import multer from "multer";
import S3Client from "../../../services/S3Client.js";

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
upload.single("avatar");

// --> /api/users/profile
const router = Router();

//Update current user profile description (authenticated user)
router.put("/description", [mdw.verifyToken], async (req, res) => {
  let description = req.body.description;
  let email = req.jwt.email;
  if (description) {
    try {
      let db = await connect();
      //find user
      let user = await db.collection("users").findOne({ email: email });
      if (user) {
        await db
          .collection("users")
          .updateOne(
            { _id: user._id },
            { $set: { "profile.description": description } }
          );
        res.status(200).send("Profile description successfully changed!");
      } else {
        res.status(404).send("User does not exist!");
      }
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    res.status(400);
  }
});
//Upload current user image (cover or avatar) (authenticated user)
router.post(
  "/image",
  [mdw.verifyToken, upload.single("image")], //upload.single(key)
  async (req, res) => {
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

    res.status(201).send("Image uploaded successfully!");
  }
);

export default router;
