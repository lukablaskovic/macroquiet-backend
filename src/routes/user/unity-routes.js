import { Router } from "express";
import connect from "../../services/mongoClient.js";
import JWT from "../../services/JWT";

// --> /api/users/games
const router = Router();

//Get user game profile from db
router.post("/find/:username", [JWT.unityCheck], async (req, res) => {
  let username = String(req.params.username);
  try {
    let db = await connect();
    let user = await db.collection("users").findOne({ username: username });
    let userData = {
      profile: user.profile,
    };
    return res.status(200).json(userData);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/add", [JWT.unityCheck], async (req, res) => {
  let changes = req.body;
  let game = JSON.parse(changes.game);

  try {
    let db = await connect();
    let user = await db
      .collection("users")
      .findOne({ username: changes.username });
    if (user) {
      let result = await db.collection("users").updateOne(
        { _id: user._id },
        {
          $push: {
            "profile.games": game,
          },
        }
      );
      res.send("Success!");
      return result.modifiedCount == 1;
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/update", [JWT.unityCheck], async (req, res) => {
  let changes = req.body;
  let game = JSON.parse(changes.game);

  let db = await connect();
  let user = await db
    .collection("users")
    .findOne({ username: changes.username });
  if (user) {
    let result = await db.collection("users").updateOne(
      { _id: user._id, "profile.games.name": game.name },
      {
        $set: {
          "profile.games.$": game,
        },
      }
    );
    res.send("Success!");
    return result.modifiedCount == 1;
  }
});

export default router;
