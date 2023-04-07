import auth from "../auth";
import connect from "../../services/mongoClient.js";

//Register new user
let register = async (req, res) => {
  let userData = req.body;
  let id = "";
  try {
    id = await auth.registerUser(userData);
    res.status(201).json({ id: id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

//Get user data from db
let getData = async (req, res) => {
  let username = String(req.params.username);
  try {
    let db = await connect();
    let user = await db.collection("users").findOne({ username: username });
    if (user) {
      let userData = {
        id: user._id,
        username: user.username,
        email: user.email,
        admin: user.admin,
        profile: user.profile,
      };
      res.status(200).json({ userData });
    } else {
      res.status(404);
    }
  } catch (e) {
    res.status(503).json({ error: e.message });
  }
};

//Change user email
let changeEmail = async (req, res) => {
  let changes = req.body;
  let newToken = req.jwt;

  if (changes.username != req.params.username) {
    res.status(401).json({ error: "Cannot change email!" });
    return;
  }

  if (changes) {
    let result = await auth.changeUserEmail(changes.username, changes.email);
    if (result) {
      let userData = changes;
      //Add token to response payload
      userData.token = newToken;
      res.status(200).json(userData);
    } else {
      res.status(500).json({ error: "Cannot change email!" });
    }
  } else {
    res.status(400).json({ error: "Wrong input!" });
  }
};

//Change user password
let changePassword = async (req, res) => {
  let changes = req.body;
  let username = req.params.username;
  try {
    if (username && changes.new_password && changes.old_password) {
      let result = await auth.changeUserPassword(
        username,
        changes.old_password,
        changes.new_password
      );
      if (result) {
        res.status(200).send({ message: "Password successfully changed." });
      }
    } else {
      res.status(400).json({ error: "Wrong query!" });
    }
  } catch (e) {
    res.status(401).send({ error: e.message });
  }
};

export default {
  register,
  changeEmail,
  changePassword,
  getData,
};
