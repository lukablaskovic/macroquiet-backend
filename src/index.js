import express from "express";
import storage from "./memory_storage.js";
import connect from "./db.js";
import cors from "cors";

const app = express();

app.use(cors()); //Omoguci CORS na svim rutama
app.use(express.json()); //automatski dekodiraj JSON poruke
const port = 3000;

app.get("/storage", async (req, res) => {
  let query = String(req.query.data);
  console.log(query);
  let db = await connect();
  let cursor = await db.collection(query).find();
  let results = await cursor.toArray();
  res.json(results);
});
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
