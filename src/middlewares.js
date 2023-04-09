import jwt from "jsonwebtoken";
import "dotenv/config";
import connect from "../services/mongoClient";

let db = null;
async function connectDatabase() {
  db = await connect();
  if (!db) {
    throw new Error("Could not connect to the database");
  }
}
connectDatabase();

export default {
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

  async adminCheck(req, res, next) {
    try {
      let userData = req.jwt;
      let user = await db
        .collection("users")
        .findOne({ username: userData.username });
      if (!user.admin) {
        res.status(401).send("Unauthorized!");
      } else return next();
    } catch (e) {
      res.send(e);
    }
  },
};
