const path = require('path');
const express = require('express');
const compress = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const uuid = require('node-uuid');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const cookieSession = require('cookie-session');

const helmet = require('helmet')


const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');

// const prettyBytes = require('pretty-bytes');
// var fs = require('fs');

// const url = require('url');
// const WebSocket = require('ws');

// const Papa= require('papaparse');
const HEX = require('./convert/hex');
const MEITREGION = require('./convert/meitregion');
const DataServer = require('./dataserver');
const MBTileServer = require('./mbtileserver');
const Socket = require('./socket');

// const async = require("async");

const COOKIE_KEY1='123456789';
const COOKIE_KEY2='123123123123';
const DOMAIN='ec-meit.ca';



const UPLOADFOLDER =  path.join(__dirname, '../../shareddrive/data/upload');
const CONVERTFOLDER =  path.join(__dirname, '../../shareddrive/data/convert');

const dotenv = require('dotenv');

dotenv.load();

const routes = require('./routes/index');
const home = require('./routes/home');
const csp = require('helmet-csp')

function WebServer(parent){
  this._parent = parent;
  const self=this;
  this.pointer = function(){return self;};
  this.hex={};
  this.construct();
}
WebServer.prototype = {
  
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},  
  
  options:{
    folder:{hex:'data/hex'},
    meitinput:'meitregions.geojson',
    sqltemplate: "template2.sql",
    // hexinput:[
    //   {id:16,file:'hex_16.hex',webid:'hex16'},
    //   {id:4,file:'hex_4.hex',webid:'hex4'},
    //   // {id:1,file:'hex_1.hex',webid:'hex1'}
    //   ],
  },
  get folder(){return this.options.folder},
  // get hexinput(){return this.options.hexinput},
  get meitinput(){return this.options.meitinput},
  get sqltemplate(){return this.options.sqltemplate;},
  construct:function(){
    const self=this;
    const app = this.app = express();
    app.use(cors());
    // app.use(compress()); 
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(helmet());
    
    //const ninetyDaysInSeconds = 7776000;
    //app.use(helmet.hpkp({
    //  maxAge: ninetyDaysInSeconds,
    //  sha256s: ['AbCdEf123=', 'ZyXwVu456=']
    //}));
    app.use(cookieSession(
      { name: 'session',
        keys: [COOKIE_KEY1,COOKIE_KEY2],
        maxAge: 1 * 60 * 60 * 1000, // 24 hours
        cookie: {
          secure: true,
          httpOnly: true,
          domain: DOMAIN,
          // path: 'foo/bar',
        }
    }));
    
    app.use(cookieParser());
    
    
    
    //app.use(csp({
    //  // Specify directives as normal.
    //  directives: {
    //    defaultSrc: ["'self'", 'ec-meit.ca'],
    //    scriptSrc: ["'self'", "'unsafe-inline'"],
        //styleSrc: ['style.com'],
        //fontSrc: ["'self'", 'fonts.com'],
    //    imgSrc: ['img.com', 'data:'],
    //    sandbox: ['allow-forms', 'allow-scripts'],
    //    reportUri: '/report-violation',
    //    objectSrc: ["'none'"],
    //    upgradeInsecureRequests: true,
    //    workerSrc: false  // This is not set.
    //  },
    
      // This module will detect common mistakes in your directives and throw errors
      // if it finds any. To disable this, enable "loose mode".
   //   loose: false,
    
      // Set to true if you only want browsers to report errors, not block them.
      // You may also set this to a function(req, res) in order to decide dynamically
      // whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.
     // reportOnly: false,
    
      // Set to true if you want to blindly set all headers: Content-Security-Policy,
      // X-WebKit-CSP, and X-Content-Security-Policy.
     // setAllHeaders: false,
    
      // Set to true if you want to disable CSP on Android where it can be buggy.
  //    disableAndroid: false,
    
      // Set to false if you want to completely disable any user-agent sniffing.
      // This may make the headers less compatible but it will be much faster.
      // This defaults to `true`.
   //   browserSniff: true
   // }))
    
    
    // app.use(express.static(path.join(__dirname, '../public')));
    
    //app.use(session({
    //    genid: function(req) {return uuid.v1();},
    //    secret: '123456789',
    //    resave:true,
    //    saveUninitialized: true,
    //    cookie: {}
    //}))
    // const strategy = new Auth0Strategy({
    //     domain:       process.env.AUTH0_DOMAIN,
    //     clientID:     process.env.AUTH0_CLIENT_ID,
    //     clientSecret: process.env.AUTH0_CLIENT_SECRET,
    //     callbackURL:  process.env.AUTH0_CALLBACK_URL
    //   }, function(accessToken, refreshToken, extraParams, profile, done) {
    //     // console.log(profile)
    //     // accessToken is the token to call Auth0 API (not needed in the most cases)
    //     // extraParams.id_token has the JSON Web Token
    //     // profile has all the information from the user
    //     profile.access_token = accessToken;//extraParams.access_token;
        
    //     return done(null, profile);
    //   });
    
    // passport.use(strategy);
    
    // // you can use this section to keep a smaller payload
    // passport.serializeUser(function(user, done) {
    //   done(null, user);
    // });
    
    // passport.deserializeUser(function(user, done) {
    //   done(null, user);
    // });
    
    // app.use(passport.initialize());
    // app.use(passport.session());
    // this.setupPassport()
    // app.use(passport.initialize());
    // app.use(passport.session());
    
    // app.get('/callback',
    //   passport.authenticate('auth0', { failureRedirect: '/login' }),
    //   function(req, res) {
    //     if (!req.user) {
    //       throw new Error('user null');
    //     }
    //     res.redirect("/");
    //   }
    // );
    
    // app.get('/',
    //   passport.authenticate('auth0', {}), function (req, res) {
    //   app.use('/',express.static(path.join(__dirname, '../private')));  
    //   res.sendFile(path.resolve(__dirname, '../private/index.html'));
    // });
    // app.post('/token', function (req, res) {
    //   console.log(req.user.access_token)
    //   res.json({token: req.user.access_token});
    // });
    // app.get('/logout', function(req, res){
    //   req.logout();
    //   res.redirect('/');
    // });
    
    
        // Check logged in
    // app.use(function(req, res, next) {
    //   res.locals.loggedIn = false;
    //   // console.log(req.session.passport)
    //   if (req.session.passport && typeof req.session.passport.user != 'undefined') {
    //     res.locals.loggedIn = true;
    //   }
      
    //   next();
    // });
    
    // app.use('/', routes);
    // app.use('/callback', home);
    
    
    // app.use(function(err, req, res, next){
    //   console.error(err.stack);
    //   return res.status(err.status).json({ message: err.message });
    // });
    app.use('/',express.static(path.join(__dirname, '../public')));  
    const checkJwt=this.checkJwt = jwt({
      secret:process.env.AUTH0_CLIENT_SECRET,
      getToken:function(req){
        var token;
        if (req.headers && req.headers.authorization) {
            var parts = req.headers.authorization.split(' ');
            
            if (parts.length == 2) {
              var scheme = parts[0];
              var credentials = parts[1];
      
              if (/^Bearer$/i.test(scheme)) {
                token = credentials;
                // console.log("log",credentials)
              } 
            }
            // console.log("here")
          req.session.token = token
        } 
        // console.log('token',req.session.token)
        return req.session.token;
      }
    });
    
    app.use('/private',checkJwt,express.static(path.join(__dirname, '../private')))
    app.get('/token', checkJwt, function(req, res) {
      res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({status:true}))
    });
    app.use(function (err, req, res, next) {
      if (err.name === 'UnauthorizedError') {
        // res.status(401).send('Invalid Token');
        res.redirect('/');
      }
    });
    // app.get('/', (req, res) => {
    //   res.sendFile(path.resolve(__dirname, '../public/index.html'));
    // });
    
    
    // // Check logged in
    // app.use(function(req, res, next) {
    //   res.locals.loggedIn = false;
    //   if (req.session.passport && typeof req.session.passport.user != 'undefined') {
    //     res.locals.loggedIn = true;
    //   }
    //   next();
    // });
    
    
    this.dataserver = new DataServer(this.pointer,this.checkJwt);
    this.mbtileserver = new MBTileServer(this.pointer,this.checkJwt);
    this.socketserver = new Socket(this.pointer,{});
    // app.use(function(err, req, res, next) {
    //   res.status(err.status || 500);
    //   console.log(err.message)
    //   // res.render('error', {
    //   //   message: err.message,
    //   //   error: err
    //   // });
    // });
    self.startServer();  


  },
  // setupPassport:function(){
  //   const strategy = new Auth0Strategy(
  //     {
  //       domain: process.env.AUTH0_DOMAIN,
  //       clientID: process.env.AUTH0_CLIENT_ID,
  //       clientSecret: process.env.AUTH0_CLIENT_SECRET,
  //       callbackURL:
  //         process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
  //     },
  //     function(accessToken, refreshToken, extraParams, profile, done) {
  //       // accessToken is the token to call Auth0 API (not needed in the most cases)
  //       // extraParams.id_token has the JSON Web Token
  //       // profile has all the information from the user
  //       return done(null, profile);
  //     }
  //   );
    
  //   passport.use(strategy);
    
  //   // you can use this section to keep a smaller payload
  //   passport.serializeUser(function(user, done) {
  //     done(null, user);
  //   });
    
  //   passport.deserializeUser(function(user, done) {
  //     done(null, user);
  //   });
  // },
  startServer:function(){
    const PORT = 8080;
    this.server.listen(PORT, function() {
      console.log('EC-MEIT app listening on port %d!',PORT);
    });
  },
};

module.exports = WebServer;


