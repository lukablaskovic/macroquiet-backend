import express from "express";
import storage from "./memory_storage.js";
import cors from "cors";

const app = express();

app.use(cors()); //Omoguci CORS na svim rutama
const port = 3000;

app.get("/storage", (req, res) => {
  let query = req.query;
  console.log(query.data);
  res.json(storage[query.data]);
});
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
