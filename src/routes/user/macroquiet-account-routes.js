import { Router } from "express";
import user from "../../user";
import connect from "../../../services/mongoClient.js";

import JWT from "../../../services/JWT";
import { ObjectId } from "mongodb";

/*
These routes are related to general data of MacroQuiet account
*/

// --> /api/users
const router = Router();

//Register new MacroQuiet account
//RegisterMethod: MacroQuiet
router.post("/", async (req, res) => {
  let userData = req.body;
  let id = "";
  try {
    id = await user.register(userData, "MacroQuiet");
    res.status(201).json({ id: id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//Get specific user data
router.get("/:id", [JWT.verifyToken], async (req, res) => {
  let userID = req.params.id;
  try {
    let db = await connect();
    let user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userID) });
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

//Get user data (authenticated user)
router.get("/current/profile", [JWT.verifyToken], async (req, res) => {
  const userID = req.jwt._id;

  try {
    let db = await connect();
    let user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userID) });

    let userData = {
      _id: user._id,
      username: user.username,
      former_usernames: user.former_usernames,
      register_method: user.register_method,
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

//Change current user password (authenticated user)
router.put("/current/password", [JWT.verifyToken], async (req, res) => {
  const userID = req.jwt._id;
  let passwords = req.body;
  try {
    if (userID && passwords.new_password && passwords.old_password) {
      let result = await user.changePassword(
        userID,
        passwords.old_password,
        passwords.new_password
      );
      if (result) {
        res.status(200).send({ message: "Password successfully changed." });
      }
    } else {
      res.status(400).json({ error: "Query input is not of correct format." });
    }
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});
//Change current user username (authenticated user)
router.put("/current/username", [JWT.verifyToken], async (req, res) => {
  const userID = req.jwt._id;
  let { new_username } = req.body;

  try {
    if (new_username) {
      let result = await user.changeUsername(userID, new_username);
      if (result) {
        let userData = result;

        res.status(200).json(userData);
      } else {
        res.status(500).json({ error: "Cannot change username!" });
      }
    } else {
      res.status(400).json({ error: "Query input is not of correct format." });
    }
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

//Send password/Forgot password email (non-authenticated user)
router.put("/current/password", async (req, res) => {
  let email = req.body.email;
  try {
    res
      .status(200)
      .send("A password reset email has been sent if such an account exists.");
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});
export default router;
