import jwt from "jsonwebtoken";
import "dotenv/config";
import connect from "../services/mongoClient";
import { ObjectId } from "mongodb";

let db = null;
async function connectDatabase() {
  db = await connect();
  if (!db) {
    throw new Error("Could not connect to the database");
  }
}
connectDatabase();
export default {
  async generate(tokenPayload, tokenDuration = "30d") {
    let token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      algorithm: "HS512",
      expiresIn: tokenDuration,
    });
    return token;
  },
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
      return res.status(401).send("Unauthorized!");
    }
  },

  async adminCheck(req, res, next) {
    try {
      let userData = req.jwt;
      let user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(userData._id) });
      if (!user.admin) {
        res.status(401).send("Unauthorized!");
      } else return next();
    } catch (e) {
      res.send(e);
    }
  },
  async regMethodCheck(req, res, next) {
    try {
      let userData = req.jwt;
      let user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(userData._id) });
      if (user.register_method !== "MacroQuiet") {
        res.status(400).send("Cannot change!");
      } else return next();
    } catch (e) {
      res.send(e);
    }
  },
};
