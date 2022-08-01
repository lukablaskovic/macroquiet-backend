
import mongoose from "mongoose"; //Mongoose is a MongoDB client library providing object-modelling for use in an asynchronous environment. Mongoose supports both promises and callbacks.
const { MongoClient } = require("mongodb");

let connection_string =
  "mongodb+srv://admin:6VKpRNUZ2cvEY9xK@cluster0.bhxeo.mongodb.net/stranded-away";

mongoose.connect(connection_string, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
    if (err) {
        console.log('Mongoose connection failed!');
    }
    else {
        console.log('Mongoose connected successfully!');
    }
}); 

// Create a new MongoClient
const client = new MongoClient(connection_string);
let db = null;
// eksportamo Promise koji resolva na konekciju
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
