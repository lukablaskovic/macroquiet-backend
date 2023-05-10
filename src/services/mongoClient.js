import { MongoClient } from "mongodb";
import "dotenv/config";

let connection_string = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(connection_string);
let db = null;

export default () => {
  return new Promise((resolve, reject) => {
    client.connect((err) => {
      if (err) {
        reject("Database connection failed!");
        console.log(err);
      } else {
        console.log("Database connected successfully!");
        db = client.db("macroquiet");
        resolve(db);
      }
    });
  });
};
