import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import logger from '../utils/logger.js';

export default () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email returned from Google'));

          // Attach structured oauth user to req — service handles DB logic
          req.oauthUser = {
            provider:   'GOOGLE',
            providerId: profile.id,
            email,
            firstName:  profile.name?.givenName  || '',
            lastName:   profile.name?.familyName || '',
            avatarUrl:  profile.photos?.[0]?.value || null,
          };

          done(null, req.oauthUser);
        } catch (err) {
          logger.error('Google OAuth strategy error:', err);
          done(err);
        }
      }
    )
  );

  // We use JWT everywhere; session-less Passport setup
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
};
