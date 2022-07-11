"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _require = require("mongodb"),
    MongoClient = _require.MongoClient;

var connection_string = process.env.CONNECTION_STRING || "mongodb+srv://admin:6VKpRNUZ2cvEY9xK@cluster0.bhxeo.mongodb.net/stranded-away"; // Create a new MongoClient

var client = new MongoClient(connection_string);
var db = null; // eksportamo Promise koji resolva na konekciju

var _default = function _default() {
  return new Promise(function (resolve, reject) {
    // ako smo inicijalizirali bazu i klijent je još uvijek spojen

    /*
    if (db && client.isConnected()) {
      resolve(db);
    } else {
      */
    client.connect(function (err) {
      if (err) {
        reject("Spajanje na bazu nije uspjelo:" + err);
      } else {
        console.log("Database connected successfully!");
        db = client.db("stranded-away");
        resolve(db);
      }
    }); //}
  });
};

exports["default"] = _default;