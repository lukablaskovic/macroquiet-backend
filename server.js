const express = require("express");

const app = express();

//Routes
app.get("/auth", async (req, res) => {
  console.log(req.query);
  res.send(`Hello ${req.query.userId} It is ${Date.now()}!`);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
