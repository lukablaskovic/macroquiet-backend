import connect from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

//Kreiranje indexa prilikom boot-a aplikacije
createIndexOnLoad();

async function createIndexOnLoad() {
  let db = await connect();
  await db.collection("users").createIndex({ username: 1 }, { unique: true });
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
}

export default {
  setToken(username, email) {
    let user = {
      username: username,
      email: email,
    };

    let tokenDuration = "7d";
    let token = jwt.sign(user, process.env.JWT_SECRET || "much_secret", {
      algorithm: "HS512",
      expiresIn: tokenDuration,
    });
    let tokenData = {
      token,
      username: username,
      email: email,
    };
    return tokenData;
  },
  async registerUser(userData) {
    let db = await connect();

    let doc = {
      username: userData.username,
      email: userData.email,
      password: await encrypt(userData.password),
      profile: {
        coverImageID: "",
        avatarImageID: "",
      },
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
  async authenticateUser(email, password, rememberMe) {
    let db = await connect();
    let user = await db.collection("users").findOne({ email: email });
    if (user && user.password && (await checkUser(password, user.password))) {
      delete user.password;

      let tokenDuration = "1h";
      if (rememberMe) tokenDuration = "7d";
      let token = jwt.sign(user, process.env.JWT_SECRET || "much_secret", {
        algorithm: "HS512",
        expiresIn: tokenDuration,
      });
      console.log("Successful login!");
      return {
        token,
        email: user.email,
        username: user.username,
      };
    } else {
      throw new Error("Cannot authenticate");
    }
  },
  async authenticateUserUnity(email, password) {
    let db = await connect();
    let user = await db.collection("users").findOne({ email: email });
    if (await checkUser(password, user.password)) {
      console.log("Successful login!");
      return {
        email: user.email,
        username: user.username,
      };
    } else {
      throw new Error("Cannot authenticate");
    }
  },
  async changeUserPassword(username, old_password, new_password) {
    let db = await connect();
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
    }
  },
  async changeUserUsername(old_username, new_username) {
    let db = await connect();
    let user = await db.collection("users").findOne({ username: old_username });

    if (user) {
      let result = await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            username: new_username,
          },
        }
      );
      return result.modifiedCount == 1;
    }
  },
  async changeUserEmail(username, new_email) {
    let db = await connect();
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
  verify(req, res, next) {
    try {
      let authorization = req.headers.authorization.split(" ");
      let type = authorization[0];
      let token = authorization[1];
      if (type !== "Bearer") {
        res.status(401).send(); //Ako nije  bearer, vrati 401
        return false;
      } else {
        req.jwt = jwt.verify(token, process.env.JWT_SECRET || "much_secret"); //Ako je sve OK, ako verify prode, exctractaj podatke u req.jwt i idi next()
        return next();
      }
    } catch (e) {
      return res.status(401).send(); //Ako dode do bilo kakvog excpetiona, vrati 401
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
