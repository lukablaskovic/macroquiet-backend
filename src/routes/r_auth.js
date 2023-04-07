import auth from "../auth";
import connect from "../../services/mongoClient.js";

//Authenticate existing user on Vue.js frontend
let authWeb = async (req, res) => {
  let userCredentials = req.body;
  if (!userCredentials) res.status(400);
  try {
    let userData = await auth.authenticateUserWeb(
      userCredentials.email,
      userCredentials.password,
      userCredentials.rememberMe
    );
    res.status(200).json(userData);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
};
//Authenticate existing user on Unity frontend
let authUnity = async (req, res) => {
  let userCredentials = req.body;
  if (!userCredentials) return res.status(400);
  try {
    let userData = await auth.authenticateUserUnity(
      userCredentials.email,
      userCredentials.password
    );
    return res.status(200).json(userData);
  } catch (e) {
    if (e.message == "User doesn't exist!")
      return res.status(404).send({ error: e.message });
    return res.status(401).send({ error: e.message });
  }
};
let confirmUserEmail = async (req, res) => {
  try {
    let db = await connect();
    let user = await db
      .collection("users")
      .findOne({ confirmationCode: req.params.confirmationCode });
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    } else {
      if (user.confirmed) {
        return res.status(400).send("Email already confirmed!");
      } else {
        let result = await db.collection("users").updateOne(
          { confirmationCode: req.params.confirmationCode },
          {
            $set: {
              confirmed: true,
            },
          }
        );
        if (result) {
          return res.redirect("https://macroquiet.com/login");
        }
      }
    }
  } catch (e) {
    return res.status(503).json({ error: e.message });
  }
};

export default { authWeb, authUnity, confirmUserEmail };
