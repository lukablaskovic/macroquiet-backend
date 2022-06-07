import "dotenv/config";

import express from "express";
//import storage from "./memory_storage.js";
import connect from "./db.js";
import cors from "cors";
import auth from "./auth.js";
const app = express();

app.use(cors()); //Omoguci CORS na svim rutama
app.use(express.json()); //automatski dekodiraj JSON poruke

const port = 4000;

//JWT token
app.get("/tajna", [auth.verify], (req, res) => {
  res.json(req.jwt.email);
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

//REST MOCK
//TO BE IMPLEMENTED

//****User interface****//

//user profile
app.get("/u", (req, res) => res.json(data.currentUser));
app.get("/u/:username", (req, res) => res.json(data.oneUser));

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
