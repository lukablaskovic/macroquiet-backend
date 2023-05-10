import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import * as path from "path";
import "dotenv/config";
import mw from "./middlewares";
import passportSetup from "../config/passport-setup.js";

//Routes

import authRoutes from "./routes/auth-routes.js";
import macroquietAccountRoutes from "./routes/user/macroquiet-account-routes.js";
import webRoutes from "./routes/user/web-routes.js";

import r_admin from "./routes/admin-routes.js";
import r_unity from "./routes/user/unity-routes.js";

const app = express();
const port = process.env.PORT;

// Set up EJS
app.use(bodyParser.json({ limit: "5mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "5mb",
    extended: true,
    parameterLimit: 5000,
  })
);
app.set("view engine", "ejs");

// Set up CORS
app.use(cors()); //Enable CORS on all routes
app.use(express.json()); //Automatically decode JSON data

/////////////////////////////////////////////////////////////
app.listen(port, () => {
  console.log(`Listening on port ${port} ✅`);
});
//Service status
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/index.html"));
});
/////////////////////////////////////////////////////////////

//User authentication
app.use("/api/auth", authRoutes);
app.use("/api/users", macroquietAccountRoutes);
app.use("/api/users/profile", webRoutes);

/*
//Admin endpoints
app.get("/admin/data/:name", r_admin.fetchData);

app.post(
  "/admin/data/:name",
  [mw.verifyToken, mw.adminCheck],
  r_admin.insertDocument
);

app.delete(
  "/admin/data/:name",
  [mw.verifyToken, mw.adminCheck],
  r_admin.deleteDocument
);

//Unity
app.get("/unity/user/profile", r_unity.getUserProfile);
app.post("/unity/user/profile/game/add", r_unity.addUserProfileGame);
app.post("/unity/user/profile/game/update", r_unity.updateUserProfileGame);
*/
