import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";

//Authentication functions
import auth from "./auth.js";

//Routes
import r_user from "./routes/r_user";
import r_storage from "./routes/r_image-store";
import r_profile from "./routes/r_profile";
import r_auth from "./routes/r_auth";
import r_admin from "./routes/r_admin";

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

//User
app.post("/user", r_user.register);
app.get("/user", [auth.verifyToken], r_user.getData);
app.patch(
  "/user/email",
  [auth.verifyToken, auth.updateToken],
  r_user.changeEmail
);
app.patch("/user/password", [auth.verifyToken], r_user.changePassword);

//User profile
app.patch(
  "/user/profile/coverImage",
  [auth.verifyToken],
  r_profile.updateCoverImage
);
app.patch(
  "/user/profile/avatarImage",
  [auth.verifyToken],
  r_profile.updateAvatarImage
);

//Storage
app.post("/image/upload", [auth.verifyToken], r_storage.upload);
app.get("/image/download", [auth.verifyToken], r_storage.download);
app.delete("/image/remove", [auth.verifyToken], r_storage.remove);

//Authentication
app.post("/auth/web", r_auth.authWeb);
app.post("/auth/unity", r_auth.authUnity);

//Admin
app.post("/admin/timeline", [auth.verifyToken], r_admin.addNewTimelinePost);
app.get("/admin/data", r_admin.fetchData);
