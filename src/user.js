import bcrypt from "bcrypt";
import "dotenv/config";

import connect from "../services/mongoClient.js";
import nodemailer from "../services/nodemailer.js";
import { ObjectId } from "mongodb";
import moment from "moment";

//Create indexes on boot
createIndexOnLoad();
let db = null;

async function createIndexOnLoad() {
  db = await connect();
  if (!db) {
    throw new Error("Could not connect to the database");
  }
  //1 - ascending index, -1 descending index
  await db.collection("users").createIndex({ username: 1 }, { unique: true });
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  console.log("Successfuly created db indexes.");
}

export default {
  //Register new user
  async register(userData) {
    let doc = {
      username: userData.username, //Can be changed every x days
      former_usernames: [],
      username_last_changed: null,
      email: userData.email, //UNIQUE
      password: await encrypt(userData.password),
      admin: false,
      confirmed: false,
      confirmationCode: nodemailer.generateToken(userData.email),
      profile: {
        description: `Hi, I am ${userData.username}. Nice to meet you!`,
        coverImageURL: "",
        avatarImageURL: "",
        games: [],
      },
    };
    try {
      let result = await db.collection("users").insertOne(doc);
      if (result && result.insertedId) {
        nodemailer.sendConfirmationEmail(
          doc.username,
          doc.email,
          doc.confirmationCode
        );
        return result.insertedId;
      }
    } catch (e) {
      console.log(e);
      if (e.code == 11000) {
        throw new Error("User already exists!");
      }
    }
  },

  async changePassword(username, old_password, new_password) {
    let user = await db.collection("users").findOne({ username: username });

    //Check if passwords match
    if (
      user &&
      user.password &&
      (await checkUser(old_password, user.password))
    ) {
      let new_password_hashed = await encrypt(new_password);
      let result = await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            password: new_password_hashed,
          },
        }
      );
      return result.modifiedCount == 1;
    } else {
      throw new Error("The old password you entered is incorrect.");
    }
  },

  async changeUsername(userID, new_username) {
    let user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userID) });
    if (user) {
      let currentTimestamp = moment();
      let result = await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            username: new_username,
            username_last_changed: currentTimestamp,
          },
          $push: { former_usernames: user.username },
        }
      );
      return result.modifiedCount == 1;
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
