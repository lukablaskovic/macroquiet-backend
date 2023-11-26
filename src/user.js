import bcrypt from "bcrypt";
import "dotenv/config";

import connect from "./services/mongoClient.js";
import nodemailer from "./services/nodemailer.js";
import { ObjectId } from "mongodb";
import moment from "moment";
let db = null;

(async () => {
  try {
    db = await connect();
    await db.collection("users").createIndex({ username: 1 }, { unique: true });
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    console.log("Successfully created indexes!");
    if (!db) {
      throw new Error("Could not connect to the database");
    }
  } catch (e) {
    console.log(e);
  }
})();

const usernameChangeInterval = 30; //in Days

const RegisterMethod = Object.freeze({
  MacroQuiet: registerMacroQuiet,
  Google: registerGoogle,
});

async function registerMacroQuiet(userData) {
  let doc = {
    username: userData.username,
    former_usernames: [],
    username_last_changed: null,
    register_method: "MacroQuiet",
    email: userData.email, //UNIQUE
    password: await encrypt(userData.password),
    admin: false,
    email_confirmed: false,
    email_confirmation_code: nodemailer.generateToken(userData.email),
    profile: {
      description: `Hi, I am ${userData.username}. Nice to meet you!`,
      image: {
        avatar: "",
        cover: "",
      },
      games: [],
    },
  };
  try {
    let result = await db.collection("users").insertOne(doc);
    if (result && result.insertedId) {
      nodemailer.sendConfirmationEmail(
        doc.username,
        doc.email,
        doc.email_confirmation_code
      );
      return result.insertedId;
    }
  } catch (e) {
    if (e.code == 11000) {
      throw new Error("User already exists!");
    }
  }
}
async function registerGoogle(userData) {
  let doc = {
    google_id: userData.google_id,
    username: userData.username,
    former_usernames: [],
    username_last_changed: null,
    register_method: "Google",
    admin: false,
    email_confirmed: true,
    profile: {
      description: `Hi, I am ${userData.username}. Nice to meet you!`,
      image: {
        avatar: "",
        cover: "",
      },
      games: [],
    },
  };
  try {
    let result = await db.collection("users").insertOne(doc);
    //Add new user
    if (result && result.insertedId) {
      return { _id: result.insertedId, google_id: userData.google_id };
    }
  } catch {
    //User already exists
    let user = await db
      .collection("users")
      .findOne({ google_id: userData.google_id });
    return user;
  }
}
export default {
  //Register new user
  async register(userData, method) {
    if (!RegisterMethod.hasOwnProperty(method)) {
      throw new Error("Invalid registration method");
    }
    const registerFunction = RegisterMethod[method];
    return registerFunction(userData);
  },

  async changePassword(userID, new_password, old_password, reset) {
    let user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userID) });

    //Password reset
    if (user && reset) {
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
      //Authenticated reset
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
    }
  },

  async changeUsername(userID, new_username) {
    let user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userID) });
    if (user) {
      let currentTimestamp = moment();

      let daysSinceLastChange = currentTimestamp.diff(
        user.username_last_changed,
        "days"
      );

      if (user.username === new_username)
        throw new Error(
          "The new username you have entered is identical to your current username. Please enter a new one."
        );
      if (
        daysSinceLastChange >= usernameChangeInterval ||
        user.username_last_changed === null
      ) {
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

        //Must wait
      } else {
        return String(usernameChangeInterval - daysSinceLastChange);
      }
    }
  },

  async updateImage(userID, publicURL, imgType) {
    let user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userID) });
    try {
      if (user) {
        let result = await db.collection("users").updateOne(
          { _id: user._id },
          {
            $set: {
              [`profile.image.${imgType}`]: publicURL,
            },
          }
        );
        return result.modifiedCount == 1;
      }
    } catch (e) {
      throw new Error(e);
    }
  },
  async findUserByID(userID) {
    let user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userID) });
    if (user) {
      return user;
    } else return null;
  },
  async deleteUser(userID) {
    let user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userID) });
    if (user) {
      try {
        let result = await db
          .collection("users")
          .deleteOne({ _id: new ObjectId(userID) });

        if (result.deletedCount > 0) {
          return true;
        } else {
          throw new Error(
            "Deletion was unsuccessful. No records were deleted."
          );
        }
      } catch (e) {
        throw new Error(
          "An error occurred while attempting to delete the user: " + e.message
        );
      }
    } else {
      throw new Error("User with the provided ID doesn't exist.");
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
