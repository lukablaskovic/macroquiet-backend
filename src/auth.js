import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

import connect from "../services/mongoClient.js";
import nodemailer from "../services/nodemailer.js";

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
  //Middleware for testing token validity
  verifyToken(req, res, next) {
    try {
      let authorization = req.headers.authorization.split(" ");
      let type = authorization[0];
      let token = authorization[1];
      if (type !== "Bearer") {
        res.status(401).send(); //If token is not Bearer type, return 401
        return false;
      } else {
        req.jwt = jwt.verify(token, process.env.JWT_SECRET); //If token is valid, extract data to req.jwt and go next()
        return next();
      }
    } catch (e) {
      return res.status(401).send("Cannot verify token");
    }
  },
  //Middleware for updating token
  updateToken(req, res, next) {
    try {
      let userData = req.body;
      let tokenDuration = "7d";
      //New token sent in response
      req.jwt = jwt.sign(userData, process.env.JWT_SECRET, {
        algorithm: "HS512",
        expiresIn: tokenDuration,
      });
      console.log("Token updated successfully!");
      return next();
    } catch (e) {
      return res.status(401).send("cannot update token");
    }
  },
  //Middleware for checking for admin rights
  async adminCheck(req, res, next) {
    try {
      let userData = req.jwt;
      let user = await db
        .collection("users")
        .findOne({ username: userData.username });
      if (!user.admin) {
        res.status(401).send("Unauthorized");
      } else return next();
    } catch (e) {
      res.send(e);
    }
  },
  //Register new user
  async registerUser(userData) {
    let doc = {
      username: userData.username,
      email: userData.email,
      password: await encrypt(userData.password),
      admin: false,
      confirmed: false,
      confirmationCode: nodemailer.generateToken(userData.email),
      profile: {
        description: `Hi, I am ${userData.username}. Nice to meet you!`,
        coverImageID: "",
        avatarImageID: "",
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
  //Modify password in database, returns true/false
  async changeUserPassword(username, old_password, new_password) {
    let user = await db.collection("users").findOne({ username: username });

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
      throw new Error("Unauthorised!");
    }
  },
  //Modify email in database, returns true/false
  async changeUserEmail(username, new_email) {
    let user = await db.collection("users").findOne({ username: username });
    if (user) {
      let result = await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            email: new_email,
          },
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
