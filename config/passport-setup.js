import passport from "passport";
import passportGoogle from "passport-google-oauth";
import user from "../src/user";
import jwt from "jsonwebtoken";

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
  console.log(profile);
  let google_id = profile.id;
  let username = profile.displayName || profile.username;

  try {
    const userID = await user.register({ google_id, username }, "Google");
    if (userID) {
      const token = generateJWT(userID);
      done(null, { token });
    } else {
      throw new Error("User not found or not unique");
    }
  } catch (error) {
    console.error("Error during registration:", error.message);
    done(error, null);
  }
};
passport.use(new GoogleStrategy(strategyOptions, verifyGoogleCallback));

const generateJWT = (userID) => {
  const tokenPayload = { userID };

  let tokenDuration = "7d";

  let token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    algorithm: "HS512",
    expiresIn: tokenDuration,
  });
  return token;
};
