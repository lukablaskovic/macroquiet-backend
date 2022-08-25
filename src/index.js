import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";

//Authentication functions
import auth from "./auth.js";

//Routes
import r_user from "./routes/r_user";
import r_imageStorage from "./routes/r_image-storage";
import r_profile from "./routes/r_profile";
import r_auth from "./routes/r_auth";
import r_admin from "./routes/r_admin";
import r_unity from "./routes/r_unity";

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

//User endpoints
app.post("/users", r_user.register);
app.get("/users/:username", [auth.verifyToken], r_user.getData);
app.patch(
  "/users/:username/email",
  [auth.verifyToken, auth.updateToken],
  r_user.changeEmail
);

app.patch(
  "/users/:username/password",
  [auth.verifyToken],
  r_user.changePassword
);

//User profile endpoints
app.patch(
  "/users/:username/profile/coverImage",
  [auth.verifyToken],
  r_profile.updateCoverImage
);

app.patch(
  "/users/:username/profile/avatarImage",
  [auth.verifyToken],
  r_profile.updateAvatarImage
);

//Storage endpoints
app.post("/images", [auth.verifyToken], r_imageStorage.upload);
app.get("/images/:id", [auth.verifyToken], r_imageStorage.download);
app.delete("/images/:id", [auth.verifyToken], r_imageStorage.remove);

//Authentication endpoints
app.post("/auth/web", r_auth.authWeb);
app.post("/auth/unity", r_auth.authUnity);
app.get("/auth/confirm/:confirmationCode", r_auth.confirmUserEmail);

//Admin endpoints
app.get("/admin/data/:name", r_admin.fetchData);

app.post(
  "/admin/data/:name",
  [auth.verifyToken, auth.adminCheck],
  r_admin.insertDocument
);

app.delete(
  "/admin/data/:name",
  [auth.verifyToken, auth.adminCheck],
  r_admin.deleteDocument
);

//Unity
app.get("/unity/user/profile", r_unity.getUserProfile);
app.post("/unity/user/profile/game/add", r_unity.addUserProfileGame);
app.post("/unity/user/profile/game/update", r_unity.updateUserProfileGame);

//Get Keys
app.get("/var/:key", async (req, res) => {
  res.json({ key: key, value: process.env.req.params.key });
});
