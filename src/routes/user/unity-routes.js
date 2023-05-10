import { Router } from "express";
import connect from "../../../services/mongoClient.js";

// --> /api/users/games
const router = Router();

//Get user game profile from db
router.get("/", async (req, res) => {
  let query = String(req.query.username);
  try {
    let db = await connect();
    let user = await db.collection("users").findOne({ username: query });
    let userData = {
      profile: user.profile,
    };
    res.send(userData);
    return;
  } catch (e) {
    res.status(500).json({ error: e.message });
    return;
  }
});

router.post("/add", async (req, res) => {
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

router.post("/update", async (req, res) => {
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
