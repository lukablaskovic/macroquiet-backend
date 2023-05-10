import passport from "passport";
import passportGoogle from "passport-google-oauth";
import user from "../src/user";
import JWT from "../services/JWT.js";

const GoogleStrategy = passportGoogle.OAuth2Strategy;

const strategyOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/redirect",
  scope: ["profile"],
};
const verifyGoogleCallback = async (
  accessToken,
  refreshToken,
  profile,
  done
) => {
  let userData = {
    google_id: profile.id,
    username: profile.displayName || profile.username,
  };
  try {
    const result = await user.register(userData, "Google");
    if (result) {
      const tokenPayload = { _id: result._id, google_id: result.google_id };
      const token = await JWT.generate(tokenPayload);
      done(null, { token });
    }
  } catch (error) {
    done(error, null);
  }
};
passport.use(new GoogleStrategy(strategyOptions, verifyGoogleCallback));
