import connect from "../db.js";
import storage from "./storage";

//Change user profile cover image
let updateCoverImage = async (req, res) => {
  let changes = req.body.id;
  let username = "azuzic"; //req.jwt.username;
  if (changes) {
    try {
      let db = await connect();
      //find user
      let user = await db.collection("users").findOne({ username: username });
      if (user) {
        //delete previous user profile cover image
        storage.setBodyID(user.profile.coverImageID);
        await storage.remove();
        //set new user profile cover ID
        await db
          .collection("users")
          .updateOne(
            { _id: user._id },
            { $set: { "profile.coverImageID": changes } }
          );
        console.log("Profile cover updated with id { " + changes + " }");
        res
          .status(201)
          .send("Profile cover updated with id { " + changes + " }");
        return;
      }
    } catch (e) {
      console.log(e);
      res.status(400).json(e);
    }
  } else {
    res.status(400).json("Wrong query!");
    return;
  }
};

//Change user profile avatar image
let updateAvatarImage = async (req, res) => {
  let changes = req.body.id;
  let username = "azuzic"; //req.jwt.username;
  if (changes) {
    try {
      let db = await connect();
      //find user
      let user = await db.collection("users").findOne({ username: username });
      if (user) {
        //delete previous user profile avatar image
        storage.setBodyID(user.profile.avatarImageID);
        await storage.remove();
        //set new user profile avatar ID
        await db
          .collection("users")
          .updateOne(
            { _id: user._id },
            { $set: { "profile.avatarImageID": changes } }
          );
        console.log("Profile avatar updated with id { " + changes + " }");
        res
          .status(201)
          .send("Profile avatar updated with id { " + changes + " }");
        return;
      }
    } catch (e) {
      console.log(e);
      res.status(400).json(e);
    }
  } else {
    res.status(400).json("Wrong query!");
    return;
  }
};

export default { updateCoverImage, updateAvatarImage };
