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

app.get("/tajna", [auth.verify], (req, res) => {
  res.json(req.jwt.email);
});

app.post("/auth", async (req, res) => {
  let userCredentials = req.body;

  try {
    let result = await auth.authenticateUser(
      userCredentials.email,
      userCredentials.password
    );
    res.json(result);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

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
