import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

//Authentification functions
import auth from "./auth.js";

//Routes
import user from "./routes/user";
import token from "./routes/token";
import storage from "./routes/storage";
import profile from "./routes/profile";
import auth_user from "./routes/auth_user.js";

const app = express();
const port = process.env.PORT || 3000;

// Set up EJS
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 500000,
  })
);

// Set up CORS
app.use(cors()); //Enable CORS on all routes
app.use(express.json()); //Automatically decode JSON data

// Set EJS as templating engine
app.set("view engine", "ejs");

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});

//JWT Token
app.get("/token", [auth.verifyToken], token.getToken);
app.post("/user/token", [auth.verifyToken], token.updateToken);

//User
app.post("/user", user.register);
app.get("/user", [auth.verifyToken], user.getData);
app.patch("/user/username", [auth.verifyToken], user.changeUsername);
app.patch("/user/email", [auth.verifyToken], user.changeEmail);
app.patch("/user/password", [auth.verifyToken], user.changePassword);

//User profile
app.patch(
  "/user/profile/coverImage",
  [auth.verifyToken],
  profile.updateCoverImage
);
app.patch(
  "/user/profile/avatarImage",
  [auth.verifyToken],
  profile.updateAvatarImage
);

//Storage
app.post("/upload/image", [auth.verifyToken], storage.upload);
app.get("/download/image", [auth.verifyToken], storage.download);
app.delete("/remove/image", [auth.verifyToken], storage.remove);

app.post("/auth/web", auth_user.authWeb);
app.post("auth/unity", auth_user.authUnity);

//Fetch from database storage
app.get("/storage", storage.fetch);

/*
//REST MOCK
//TO BE IMPLEMENTED

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
