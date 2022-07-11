const { MongoClient } = require("mongodb");

let connection_string = process.env.CONNECTION_STRING;
// Create a new MongoClient
const client = new MongoClient(connection_string);
let db = null;
// eksportamo Promise koji resolva na konekciju
export default () => {
  return new Promise((resolve, reject) => {
    // ako smo inicijalizirali bazu i klijent je još uvijek spojen
    /*
    if (db && client.isConnected()) {
      resolve(db);
    } else {
      */
    client.connect((err) => {
      if (err) {
        reject("Spajanje na bazu nije uspjelo:" + err);
      } else {
        console.log("Database connected successfully!");
        db = client.db("stranded-away");
        resolve(db);
      }
    });
    //}
  });
};
