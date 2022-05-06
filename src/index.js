import express from "express";

const app = express();

//Routes
app.get("/auth", async (req, res) => {
  console.log(req.query);
  res.send(`Hello ${req.query.userId} It is ${Date.now()}!`);
});

let studentHandler = (req, res) => {
  let upit = req.params;
  let upit2 = req.query;
  console.log(upit);
  //. obično bi ovdje odredili koji je odgovor
  let odgovor = {
    upit, //vraćamo upit natrag, čisto za provjeru
    status: "uspješno",
  };
  res.json(odgovor);
};
app.get("/student/:uid", studentHandler);

const port = 3000;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
