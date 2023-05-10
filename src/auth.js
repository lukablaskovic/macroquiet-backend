import bcrypt from "bcrypt";
import "dotenv/config";

import connect from "./services/mongoClient.js";
import JWT from "./services/JWT.js";
let db = null;
(async () => {
  try {
    db = await connect();
    if (!db) {
      throw new Error("Could not connect to the database");
    }
  } catch (e) {
    console.log(e);
  }
})();

export default {
  //Authenticate user and send JWT token
  async authenticateUser(email, password, rememberMe = false) {
    let user = await db.collection("users").findOne({ email: email });
    if (user && user.password && (await checkUser(password, user.password))) {
      if (user.register_method !== "MacroQuiet") {
        throw new Error(
          "Can't login. Try using the authentication method you used during sign up."
        );
      }
      if (!user.email_confirmed) {
        throw new Error("Please confirm your email to login!");
      }
      const tokenPayload = { _id: user._id, email: user.email };

      let token = await JWT.generate(tokenPayload);

      return {
        token,
        email: user.email,
        username: user.username,
        admin: user.admin,
      };
    } else {
      throw new Error("Wrong username or password!");
    }
  },
};

const saltRounds = 10;

async function encrypt(plainTextPassword) {
  const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
  return hashedPassword;
}
async function checkUser(password, passwordHash) {
  const match = await bcrypt.compare(password, passwordHash);
  return match;
}
