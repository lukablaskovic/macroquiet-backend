import auth from "../auth";

//Authenticate existing user on Vue.js frontend
let authWeb = async (req, res) => {
  let userCredentials = req.body;
  try {
    let userData = await auth.authenticateUser(
      userCredentials.email,
      userCredentials.password,
      userCredentials.rememberMe
    );
    res.json(userData);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
};
//Authenticate existing user on Unity frontend
let authUnity = async (req, res) => {
  console.log("Request received");
  let userCredentials = req.body;
  //console.log(userCredentials);
  try {
    let result = await auth.authenticateUserUnity(
      userCredentials.email,
      userCredentials.password
    );
    console.log(result);
    res.send(result);
  } catch (e) {
    res.status(401).send({ error: e.message });
  }
};
export default { authWeb, authUnity };
