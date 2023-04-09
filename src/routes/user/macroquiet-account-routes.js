import { Router } from "express";
import user from "../../user";
import connect from "../../../services/mongoClient.js";

import mdw from "../../middlewares";

/*
These routes are related to general data of MacroQuiet account
*/

// --> /api/users
const router = Router();

//Register new MacroQuiet account
router.post("/", async (req, res) => {
  let userData = req.body;
  let id = "";
  try {
    id = await user.register(userData);
    res.status(201).json({ id: id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//Get current user data
router.get("/current/profile", [mdw.verifyToken], async (req, res) => {
  let username = req.jwt.username;
  try {
    let db = await connect();
    let user = await db.collection("users").findOne({ username: username });

    let userData = {
      id: user._id,
      username: user.username,
      former_usernames: user.former_usernames,
      username_last_changed: user.username_last_changed,
      email: user.email,
      admin: user.admin,
      profile: user.profile,
    };
    res.status(200).json(userData);
  } catch (e) {
    res.status(503).json({ error: e.message });
  }
});

//Get specific user data
router.get("/:username", [mdw.verifyToken], async (req, res) => {
  let username = String(req.params.username);
  try {
    let db = await connect();
    let user = await db.collection("users").findOne({ username: username });
    if (user) {
      let userData = {
        id: user._id,
        username: user.username,
        former_usernames: user.former_usernames,
        username_last_changed: user.username_last_changed,
        email: user.email,
        admin: user.admin,
        profile: user.profile,
      };
      res.status(200).json(userData);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (e) {
    res.status(503).json({ error: e.message });
  }
});

//Change password for authenticated user
router.patch("/:username/password", [mdw.verifyToken], async (req, res) => {
  let changes = req.body;
  let username = req.jwt.username;
  try {
    if (username && changes.new_password && changes.old_password) {
      let result = await user.changePassword(
        username,
        changes.old_password,
        changes.new_password
      );
      if (result) {
        res.status(200).send({ message: "Password successfully changed." });
      }
    } else {
      res.status(400).json({ error: "Query input is not of correct format." });
    }
  } catch (e) {
    res.status(401).send({ error: e.message });
  }
});
//Change user's username
router.put("/:id/username", [mdw.verifyToken], async (req, res) => {
  let userID = req.params.id;
  let { new_username } = req.body;
  console.log(userID);
  console.log(new_username);
  //let newToken = req.jwt;

  if (new_username) {
    let result = await user.changeUsername(userID, new_username);
    if (result) {
      let userData = result;
      //Add token to response payload
      //userData.token = newToken;
      res.status(200).json(userData);
    } else {
      res.status(500).json({ error: "Cannot change username!" });
    }
  } else {
    res.status(400).json({ error: "Query input is not of correct format." });
  }
});

export default router;
