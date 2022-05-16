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
    console.log(email, password);
    let db = await connect();
    let user = await db.collection("users").findOne({ email: email });
    console.log(user);
    if (user && user.password && (await checkUser(password, user.password))) {
      delete user.password;
      let token = jwt.sign(user, process.env.JWT_SECRET, {
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
  verify(req, res, next) {
    try {
      let authorization = req.headers.authorization.split(" ");
      let type = authorization[0];
      let token = authorization[1];
      console.log(type, token);
      if (type !== "Bearer") {
        res.status(401).send(); //Ako nije  bearer, vrati 401
        return false;
      } else {
        req.jwt = jwt.verify(token, process.env.JWT_SECRET); //Ako je sve OK, ako verify prode, exctractaj podatke u req.jwt i idi next()
        return next();
      }
    } catch (e) {
      return res.status(401).send(); //Ako dode do bilo kakvog excpetiona, vrati 401
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
