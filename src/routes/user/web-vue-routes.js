import { Router } from "express";
import mdw from "../../middlewares";

import connect from "../../../services/mongoClient.js";

// --> /api/users/profile
const router = Router();

//Update user profile object
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

export default router;
