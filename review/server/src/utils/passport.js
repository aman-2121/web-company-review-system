const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const { User } = require('../models');

// Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email: email.toLowerCase() } });

      if (!user) {
        return done(null, false, { message: 'No account found with this email' });
      }

      // Check if user has a password (for Google users)
      if (!user.password) {
        return done(null, false, { message: 'Please use Google to sign in with this email' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid password' });
      }

      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));

// ✅ FIXED Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth profile received:', profile.displayName);
    
    // Check if user exists with Google ID
    let user = await User.findOne({ where: { googleId: profile.id } });
    if (user) {
      console.log('User found with Google ID:', user.id);
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ where: { email: profile.emails[0].value } });
    if (user) {
      console.log('User found with email, linking Google ID:', user.id);
      // Link Google account to existing user
      user.googleId = profile.id;
      await user.save();
      return done(null, user);
    }

    // Create new user
    console.log('Creating new user with Google OAuth');
    const newUser = await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      role: 'user', // ✅ FIXED: Use 'role' not 'roleId'
    });
    
    console.log('New user created via Google OAuth:', newUser.id);
    return done(null, newUser);
  } catch (err) {
    console.error('Google OAuth error:', err);
    return done(err, false);
  }
}));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;