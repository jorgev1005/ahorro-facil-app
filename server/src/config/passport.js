const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://api.grupoaludra.com/api/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, cb) {
        try {
            console.log("Google Profile:", profile);
            // Find or create user
            let user = await User.findOne({ where: { googleId: profile.id } });

            if (!user) {
                // Check if email already exists
                const email = profile.emails[0].value;
                user = await User.findOne({ where: { email } });

                if (user) {
                    // Link Google Account to existing email account
                    user.googleId = profile.id;
                    await user.save();
                } else {
                    // Create new user
                    user = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: email,
                        // Password can be null or a random string since they login via Google
                        // We'll leave it null if the model allows, otherwise random
                        password: null // handled by model allow Null
                    });
                }
            }
            return cb(null, user);
        } catch (err) {
            return cb(err, null);
        }
    }
));

// Serialize/Deserialize not needed for JWT stateless auth, 
// but passport might require it for session support if we used it.
// We are using stateless JWT, so we handle token generation in the callback.
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
