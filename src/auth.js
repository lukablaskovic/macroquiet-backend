import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

import connect from "../services/mongoClient.js";

let db = null;
async function connectDatabase() {
  db = await connect();
  if (!db) {
    throw new Error("Could not connect to the database");
  }
}
connectDatabase();

export default {
  //Authenticate user and send JWT token
  async authenticateUserWeb(email, password, rememberMe) {
    let user = await db.collection("users").findOne({ email: email });
    if (user && user.password && (await checkUser(password, user.password))) {
      if (!user.confirmed) {
        throw new Error("Please confirm your email to login!");
      }
      //Delete fields which won't be included in the token
      delete user.password;
      delete user.profile;
      delete user.admin;
      delete user.confirmed;
      delete user.confirmationCode;
      let tokenDuration = "1d";
      if (rememberMe) tokenDuration = "30d";

      let token = jwt.sign(
        user, //Included in payload
        process.env.JWT_SECRET,
        {
          algorithm: "HS512",
          expiresIn: tokenDuration,
        }
      );
      console.log("Successful login!");

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
  //Authenticate user for Unity interface
  async authenticateUserUnity(email, password) {
    let user = await db.collection("users").findOne({ email: email });
    if (!user) {
      throw new Error("User doesn't exist!");
    }
    if (await checkUser(password, user.password)) {
      console.log("Successful login!");
      return {
        email: user.email,
        username: user.username,
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
