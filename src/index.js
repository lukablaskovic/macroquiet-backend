import "dotenv/config";

import express from "express";
//import storage from "./memory_storage.js";
import connect from "./db.js";
import cors from "cors";
import auth from "./auth.js";

import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';    //The module “body-parser” enables reading (parsing) HTTP-POST data.
import upload from './imageUpload.js';
import { async } from "regenerator-runtime";

const app = express();

// Set up EJS
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Set EJS as templating engine 
app.set("view engine", "ejs");

app.use(cors()); //Omoguci CORS na svim rutama
app.use(express.json()); //automatski dekodiraj JSON poruke

const port = process.env.PORT || 3000;

//JWT token
app.get("/tajna", [auth.verify], (req, res) => {
  res.json(req.jwt.email);
});

//GET JWT token
app.post("/user/token", [auth.verify], (req, res) => {
    let userdata = req.body;
    try {
        let tokenData = auth.setToken(userdata.username, userdata.email);
        res.json(tokenData);
    }
    catch (e) {
         res.status(401).json({ error: e.message });
    }
});

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

//Change user password
app.patch("/user/password", [auth.verify], async (req, res)=> {
    let changes = req.body; 
    
    if (changes.username && changes.new_password && changes.old_password) {
        let result = await auth.changeUserPassword(changes.username, changes.old_password, changes.new_password)

        if (result) {
            res.status(201).send();
        }
        else {
            res.status(500).json({ error: "Cannot change password!" });
        }
    }
    else {
        res.status(400).json({ error: "Wrong query!" }); 
    }
})

//Change user username
app.patch("/user/username", [auth.verify], async (req, res)=> {
    let changes = req.body; 
    let old_username = req.jwt.username;
    if (changes) {
        let result = await auth.changeUserUsername(old_username, changes.new_username)
        if (result) {
            res.status(201).send();
        }
        else {
            res.status(500).json({ error: "Cannot change username!" });
        }
    }
    else {
        res.status(400).json({ error: "Wrong query!" }); 
    }
})

//Change user email
app.patch("/user/email", [auth.verify], async (req, res)=> {
    let changes = req.body; 
    let username = req.jwt.username;
    if (changes) {
        let result = await auth.changeUserEmail(username, changes.new_email)
        
        if (result) {
            res.status(201).send();
        }
        else {
            res.status(500).json({ error: "Cannot change email!" });
        }
    }
    else {
        res.status(400).json({ error: "Wrong query!" }); 
    }
})

//Register new user
app.post("/users", async (req, res) => {
  let user = req.body;
  let id;

  try {
    id = await auth.registerUser(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
    return;
  }
  res.json({ id: id });
});
//GET,POST, PUT i DELETE
//Fetch from database storage
app.get("/storage", async (req, res) => {
  let query = String(req.query.data);

  let db = await connect();
  let cursor = await db.collection(query).find();
  let results = await cursor.toArray();

  res.json(results);
});

app.get("/image", async(req, res) => {
    let data = await auth.getImage(req, res); 
    /*console.log(data); 
    const buffer = Buffer.from(data, "base64");
    res.writeHead(200, { 
        'Content-Type': 'image/png',
        'Content-Length': buffer.length 
    });
    res.end(buffer);*/
    res.json(data);
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});

//REST MOCK
//TO BE IMPLEMENTED 

//****User interface****//

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

//+ backend dio za povezivanje/autentifikaciju/modulaciju podataka unutar same Unity igre

//POST handler for processing the uploaded file
var imgModel = require('./model').default;
app.post('/upload', upload.single('image'), (req, res, next) => {
    let localPath = path.join(__dirname.slice(0, -3) + 'uploads/' + req.file.filename);
    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(localPath),
            contentType: 'image/png'
        }
    }
    imgModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            item.save();
            let data = item;
            fs.unlink(localPath, err => {
                if (err) throw err;
            });
            res.status(201).send("Image { " + data.name + " } with id { " + data._id + " } succesfully uploaded!");
        }
    });
});