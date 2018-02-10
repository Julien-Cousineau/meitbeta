const express = require('express');
const passport = require('passport');
const router = express.Router();
const path = require('path');

const env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL:process.env.AUTH0_CALLBACK_URL
};


router.get('/', function(req, res) {
  // console.log(req.headers)
  router.use(express.static(path.join(__dirname, '../../public')));
  // console.log(req.params)
  res.sendFile(path.resolve(__dirname, '../../public/index.html'));
});

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index');
// });

router.get('/login',
  function(req, res){
    // res.render('login', { env: env });
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// router.get('/callback',
//   // passport.authenticate('auth0', { failureRedirect: '/failure' }),
//   function(req, res) {
//     console.log(req)
//     // res.redirect(req.session.returnTo || '/user');
//   });

// router.get('/callback',
//   passport.authenticate('auth0', {
//     failureRedirect: '/failure'
//   }),
//   function(req, res) {
//     console.log(req)
//     res.redirect('/home');
//   }
// );

router.get('/failure', function(req, res) {
  var error = req.flash("error");
  var error_description = req.flash("error_description");
  console.log(req)
  req.logout();
  
  res.render('failure', {
    error: error[0],
    error_description: error_description[0],
  });
});

module.exports = router;