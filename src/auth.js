import mongo from "mongodb";
import connect from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//Kreiranje indexa prilikom boot-a aplikacije
createIndexOnLoad();

export default {
  async registerUser(userData) {
    let db = await connect();

    let doc = {
      username: userData.username,
      email: userData.email,
      password: await encrypt(userData.password),
    };

    try {
      let result = await db.collection("users").insertOne(doc);
      if (result && result.insertedId) {
        return result.insertedId;
      }
    } catch (e) {
      console.log(e);
      if (e.code == 11000) {
        console.log("ERROR 1100");
        throw new Error("User already exists!");
      }
    }
  },
  async authenticateUser(email, password) {
    let db = await connect();
    let user = await db.collection("users").findOne({ email: email });
    if (user && user.password && (await checkUser(password, user.password))) {
      delete user.password;
      let token = jwt.sign(user, "tajna", {
        algorithm: "HS512",
        expiresIn: "1 week",
      });
      console.log("Successful login!");
      return {
        token,
        email: user.email,
      };
    } else {
      throw new Error("Cannot authenticate");
    }
  },
};
async function createIndexOnLoad() {
  let db = await connect();
  await db
    .collection("users")
    .createIndex({ username: 1, email: 1 }, { unique: true });
}

const saltRounds = 10;

async function encrypt(plainTextPassword) {
  const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
  return hashedPassword;
}

async function checkUser(password, passwordHash) {
  const match = await bcrypt.compare(password, passwordHash);
  console.log(match);
  return match;
}
