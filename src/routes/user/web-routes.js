import { Router } from "express";
import JWT from "../../services/JWT";

import connect from "../../services/mongoClient.js";
import user from "../../user";
import { ObjectId } from "mongodb";

import multer from "multer";
import S3Client from "../../services/S3Client";

//import sharp from "sharp";
import crypto from "crypto";

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
upload.single("avatar");

// --> /api/users/profile
const router = Router();

//Update current user profile description (authenticated user)
router.put("/description", [JWT.verifyToken], async (req, res) => {
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
        res
          .status(200)
          .json({ message: "Profile description successfully changed!" });
      } else {
        res.status(404).json({ error: "User does not exist!" });
      }
    } catch (e) {
      res.status(500).json({ error: e });
    }
  } else {
    res.status(400).json({ error: "Bad request!" });
  }
});

async function getCurrentImageKey(userID, type) {
  try {
    let db = await connect();
    //find user
    let user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userID) });

    const urlStr = user.profile.image[type];

    const url = new URL(urlStr);

    const parts = url.pathname.split("/").slice(2);
    let key = parts.join("/");

    return key;
  } catch (e) {
    return null;
  }
}

const imgTypes = Array.of("avatar", "cover");
//Upload current user image (cover or avatar) (authenticated user)
router.put(
  "/image",
  [JWT.verifyToken, upload.single("image")], //upload.single(key)
  async (req, res) => {
    const userID = req.jwt._id;
    let providedType = String(req.body.type);
    if (imgTypes.includes(providedType)) {
      try {
        const imageName = randomImageName();
        const updateParams = {
          Bucket: BUCKET_NAME,
          Key: `${String(providedType)}/${imageName}`,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        let command = new S3Client.PutObjectCommand(updateParams);
        await S3Client.S3.send(command);

        let publicURL = `https://${BUCKET_NAME}.s3.amazonaws.com/${updateParams.Key}`;

        let currentKey = await getCurrentImageKey(userID, providedType);
        let objectToDelete = `${providedType}/${currentKey}`;

        //Deletes from aws
        const deleteParams = {
          Bucket: BUCKET_NAME,
          Key: objectToDelete,
        };
        command = new S3Client.DeleteObjectCommand(deleteParams);
        await S3Client.S3.send(command);

        //Update image in db
        let storeInDB = await user.updateImage(userID, publicURL, providedType);

        S3Client.S3.destroy;

        if (storeInDB)
          res.status(201).json({
            message: "Image uploaded successfully!",
            publicURL: publicURL,
          });
      } catch (e) {
        res.status(400).json({ error: e });
      }
    } else res.status(400).json({ error: "Wrong image type provided." });
  }
);

export default router;
