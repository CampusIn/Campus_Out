import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "../config/config.js";
import userModel from "../models/user.models.js";

const googleStrategy = new GoogleStrategy(
  {
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: config.GOOGLE_CALLBACK_URL,
  },

  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;

      if (!email) {
        return done(new Error("Google account has no email"), null);
      }

      const username = profile.displayName;
      const googleId = profile.id;
      const profilePicture = profile.photos?.[0]?.value ?? null;

      let user = await userModel.findOne({
        email,
      });

      // Existing User
      if (user) {
        // Google account already linked?
        if (user.googleId && user.googleId !== googleId) {
          return done(
            new Error("Google account mismatch"),
            null
          );
        }

        if (!user.googleId) {
          user.googleId = googleId;
        }

        user.profilePicture = profilePicture;

        if (!user.verified) {
          user.verified = true;
        }

        await user.save();

        return done(null, user);
      }

      // New User
      user = await userModel.create({
        username,
        email,
        verified: true,
        role: "user",
        authProvider: "google",
        googleId,
        profilePicture,
      });

      return done(null, user);

    } catch (error) {
      return done(error, null);
    }
  }
);

export default googleStrategy;
