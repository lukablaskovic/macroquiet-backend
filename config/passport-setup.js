import passport from "passport";
import passportGoogle from "passport-google-oauth";

const GoogleStrategy = passportGoogle.OAuth2Strategy;

const strategyOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/redirect",
  scope: ["profile"],
};
const verifyCallback = async (accessToken, refreshToken, profile, done) => {
  console.log(profile);
};
passport.use(new GoogleStrategy(strategyOptions, verifyCallback));
