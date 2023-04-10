import { Router } from "express";
import mdw from "../../middlewares";

import connect from "../../../services/mongoClient.js";
import user from "../../user";

import multer from "multer";
import S3Client from "../../../services/S3Client.js";

import sharp from "sharp";
import crypto from "crypto";

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
upload.single("avatar");

const imgTypes = Array.of("avatar", "cover");

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
    const userID = req.jwt._id;
    let providedType = String(req.body.type);
    if (imgTypes.includes(providedType)) {
      try {
        const imageName = randomImageName();
        const params = {
          Bucket: BUCKET_NAME,
          Key: `${String(providedType)}/${imageName}`,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        let command = new S3Client.PutObjectCommand(params);
        await S3Client.S3.send(command);

        let publicURL = `https://macroquiet-images.s3.amazonaws.com/${params.Key}`;
        //Update image in db
        let storeInDB = await user.updateImage(userID, publicURL, providedType);
        if (storeInDB) res.status(201).send("Image uploaded successfully!");
      } catch (e) {
        res.status(400).send(e);
      }
    } else res.status(400).send("Wrong image type provided.");
  }
);

export default router;
