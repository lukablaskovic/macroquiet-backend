import "dotenv/config";
import express from "express";
import connect from "./db.js";
import cors from "cors";
import auth from "./auth.js";
/*
import fs from "fs";
import path from "path";
import bodyParser from "body-parser"; //The module “body-parser” enables reading (parsing) HTTP-POST data.
import upload from "./imageUpload.js";
*/

import user from "./routes/user";
import token from "./routes/token";
const app = express();
/*
// Set up EJS
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set EJS as templating engine
app.set("view engine", "ejs");
*/
app.use(cors()); //Omoguci CORS na svim rutama
app.use(express.json()); //automatski dekodiraj JSON poruke

const port = process.env.PORT || 3000;

//Token
app.get("/token", [auth.verify], token.getToken);
app.post("/user/token", [auth.verify], token.updateToken);

//User
app.post("/user", user.register);
app.patch("/user/username", [auth.verify], user.changeUsername);
app.patch("/user/email", [auth.verify], user.changeEmail);
app.patch("/user/password", [auth.verify], user.changePassword);

//Authenticate existing user
app.post("/auth", async (req, res) => {
  let userCredentials = req.body;

  try {
    let result = await auth.authenticateUser(
      userCredentials.email,
      userCredentials.password,
      userCredentials.rememberMe
    );
    res.json(result);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});
//Fetch from database storage
app.get("/storage", async (req, res) => {
  let query = String(req.query.data);

  let db = await connect();
  let cursor = await db.collection(query).find();
  let results = await cursor.toArray();

  res.json(results);
});
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
/*
app.get("/image", async (req, res) => {
  let data = await auth.getImage(req, res);
  console.log(data); 
    const buffer = Buffer.from(data, "base64");
    res.writeHead(200, { 
        'Content-Type': 'image/png',
        'Content-Length': buffer.length 
    });
    res.end(buffer);
  res.json(data);
})

*/

//REST MOCK
//TO BE IMPLEMENTED

//****User interface****//
/*
//user profile
app.get("/user", (req, res) => res.json(data.currentUser));
app.get("/user/:username", (req, res) => res.json(data.oneUser));

//available games
app.get("/games:gameName", (req, res) => res.json(data.gameDetails));
app.get("/games:gameName/download", (req, res) =>
  res.json(data.gameDetails.fileForDownload)
);

//scoreboard
app.get("/games/:gameName/scoreboard", (req, res) =>
  res.json(data.game.scoreboard)
);

//****Admin interface****/
/*
//add new post
app.post("/post", (req, res) => {
  res.statusCode = 201;
  res.setHeader("Location", "/posts/21");
  res.send();
});
//add new game details
app.post("/games", (req, res) => {
  res.statusCode = 201;
  res.setHeader("Location", "/games/newGameName");
  res.send();
});
*/
//+ backend dio za povezivanje/autentifikaciju/modulaciju podataka unutar same Unity igre

//POST handler for processing the uploaded file
/*
var imgModel = require("./model").default;
app.post("/upload", upload.single("image"), (req, res, next) => {
  let localPath = path.join(
    __dirname.slice(0, -3) + "uploads/" + req.file.filename
  );
  var obj = {
    name: req.body.name,
    desc: req.body.desc,
    img: {
      data: fs.readFileSync(localPath),
      contentType: "image/png",
    },
  };
  imgModel.create(obj, (err, item) => {
    if (err) {
      console.log(err);
    } else {
      item.save();
      let data = item;
      fs.unlink(localPath, (err) => {
        if (err) throw err;
      });
      res
        .status(201)
        .send(
          "Image { " +
            data.name +
            " } with id { " +
            data._id +
            " } succesfully uploaded!"
        );
    }
  });
});
*/
