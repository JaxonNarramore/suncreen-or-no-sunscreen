require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('./config/ppConfig');
const flash = require('connect-flash');
const SECRET_SESSION = process.env.SECRET_SESSION;
const app = express();
const cookieSession = require('cookie-session');
const methodOverride = require('method-override')

const isLoggedIn = require('./middleware/isLoggedIn');
const db = require('./models');

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(cookieSession({ maxAge: 86400000, keys: [process.env.COOKIE_KEY] }))
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);
app.use(methodOverride('_method'))

// secret: what we actually will be giving the user on our site as a session cookie
// resave: saves the session even if its modified, make this false 
// saveUninitialized: if we have a new session, we save it, therefor making that true 
const sessionObject = {
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized: true
}

app.use(session(sessionObject));

// Initalize passport and run through middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash
// Using flash throughout app to send temporary messages to user
app.use(flash());

// Messages that will be acessable to every view
app.use((req, res, next) => {
  // before every route, we will attach user to res.local
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
})

app.get('/', (req, res) => {
  console.log(res.locals.alerts);
  res.render('index', { alerts: res.locals.alerts });
});

app.get('/update', isLoggedIn, (req, res) => {
  res.render('update', { user: req.user })
})

app.put('/update', (req, res) => {
  db.user.update({
    email: req.body.email
  }, {
    where: { id: req.user.id }
  }).then(() => {
    res.redirect('/profile')
  })
})

app.use('/auth', require('./routes/auth'));

app.use('/airquality', require('./routes/airquality'));

app.use('/profile', require('./routes/profile'))


const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
