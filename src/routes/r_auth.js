import auth from "../auth";
import connect from "../db.js";

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
  console.log("Request received");
  let userCredentials = req.body;
  if (!userCredentials) res.status(400);
  try {
    let userData = await auth.authenticateUserUnity(
      userCredentials.email,
      userCredentials.password
    );
    res.status(200).json(userData);
  } catch (e) {
    if (e.message == "User doesn't exist!")
      res.status(404).send({ error: e.message });
    res.status(401).send({ error: e.message });
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
      if (user.confirmed)
        res.status(400).send({ message: "Email already confrimed!" });
      let result = await db.collection("users").updateOne(
        { confirmationCode: req.params.confirmationCode },
        {
          $set: {
            confirmed: true,
          },
        }
      );
      if (result) res.redirect(200, "https://macroquiet.com/login");
    }
  } catch (e) {
    res.status(503).json({ error: e.message });
    return;
  }
};

export default { authWeb, authUnity, confirmUserEmail };
