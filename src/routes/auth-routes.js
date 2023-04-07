import { Router } from "express";
import passport from "passport";

const router = Router();

router.get("/logout", (req, res) => {
  res.send("logging out");
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

router.get("/google/redirect", (req, res) => {
  res.send("You reached the callback URI");
});

export default router;
