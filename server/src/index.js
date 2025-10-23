// server/src/index.js

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');


require('dotenv').config();

const sequelize = require('./config/db');

// ✅ Step 1: Initialize models (this runs model factories)
require('./models'); // ← Important: ensures User is defined

// ✅ Step 2: Initialize Passport
const passport = require('./utils/passport'); // ← This calls passport.use(...)

// ✅ Step 3: Set up Express
const app = express();
const PORT = process.env.PORT || 5173;

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(cookieParser());

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true },
}));

// ✅ Step 4: Use Passport
app.use(passport.initialize());
app.use(passport.session());

// ✅ Step 5: Routes
app.use('/auth', require('./users/user.routes'));
app.use('/api/companies', require('./companies/company.routes'));
app.use('/api/reviews', require('./reviews/review.routes'));
app.use('/api/types', require('./types/types.routes')); 


// ✅ DB Sync & Start Server
sequelize.sync({ alter: true })
  .then(() => {
    console.log("✅ DB Sync & Start Server")
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ DB Sync failed:', err);
  });