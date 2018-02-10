const express = require('express');
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const router = express.Router();
const path = require('path');

/* GET user profile. */
// router.get('/', ensureLoggedIn, function(req, res, next) {
  
// });
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');


// const express = require('express');
// const passport = require('passport');
// const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
// const router = express.Router();

/* GET user profile. */
router.use('/',ensureLoggedIn,express.static(path.join(__dirname, '../../private')));  
router.get('/', ensureLoggedIn, function(req, res, next) {
  res.sendFile(path.resolve(__dirname, '../../private/index.html'));
  // res.render('user', { user: req.user });
});

module.exports = router;



const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  // secret: jwksRsa.expressJwtSecret({
  //   cache: true,
  //   rateLimit: true,
  //   jwksRequestsPerMinute: 5,
  //   jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  // }),

  // Validate the audience and the issuer.
//   audience: process.env.AUTH0_AUDIENCE,
  secret:process.env.AUTH0_CLIENT_SECRET,
  getToken:function(req){
    console.log(req.query.token)
    return req.query.token;
  }
  // audience: process.env.AUTH0_AUDIENCE,
  // issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  // algorithms: ['RS256']
});

// const checkScopes = jwtAuthz(['read:messages']);

// app.get('/api/public', function(req, res) {
//   res.json({
//     message: 'Hello from a public endpoint! You don\'t need to be authenticated to see this.'
//   });
// });

// app.get('/api/private', checkJwt, function(req, res) {
//   res.json({
//     message: 'Hello from a private endpoint! You need to be authenticated to see this.'
//   });
// });



// // router.use('/',express.static(path.join(__dirname, '../../private')));
// router.get('/',checkJwt, function(req, res) {
//   // console.log(req.params)
//   router.use('/',express.static(path.join(__dirname, '../../private')));  
//   res.sendFile(path.resolve(__dirname, '../../private/index.html'));
// });
module.exports = router;