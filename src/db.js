const { MongoClient } = require("mongodb");
import "dotenv/config";

let connection_string = process.env.CONNECTION_STRING;
// Create a new MongoClient
const client = new MongoClient(connection_string);
let db = null;

// Export promise which resolves on connection
export default () => {
  return new Promise((resolve, reject) => {
    client.connect((err) => {
      if (err) {
        reject("Database connection failed!");
      } else {
        console.log("Database connected successfully!");
        db = client.db("stranded-away");
        resolve(db);
      }
    });
  });
};
