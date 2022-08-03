import "dotenv/config";
import express from "express";
import connect from "./db.js";
import cors from "cors";
import auth from "./auth.js";

import user from "./routes/user";
import token from "./routes/token";
import storage from "./routes/storage";
import profile from "./routes/profile";

import bodyParser from "body-parser";

const app = express();

// Set up CORS
app.use(cors()); //Omoguci CORS na svim rutama
app.use(express.json()); //automatski dekodiraj JSON poruke

// Set up EJS
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 500000000,
  })
);

// Set EJS as templating engine
app.set("view engine", "ejs");

const port = process.env.PORT;

//Token
app.get("/token", [auth.verify], token.getToken);
app.post("/user/token", [auth.verify], token.updateToken);

//User
app.post("/user", user.register);
app.get("/user", [auth.verify], user.getData);
app.patch("/user/username", [auth.verify], user.changeUsername);
app.patch("/user/email", [auth.verify], user.changeEmail);
app.patch("/user/password", [auth.verify], user.changePassword);

//Profile
app.patch("/user/profile/coverImage", [auth.verify], profile.updateCoverImage);
app.patch(
  "/user/profile/avatarImage",
  [auth.verify],
  profile.updateAvatarImage
);

//Storage
app.post("/upload/image", [auth.verify], storage.upload);
app.get("/download/image", [auth.verify], storage.download);
app.delete("/remove/image", [auth.verify], storage.remove);

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
//REST MOCK
//TO BE IMPLEMENTED
//User interface
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
//Admin interface
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
*/
