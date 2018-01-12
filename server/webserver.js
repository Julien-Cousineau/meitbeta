const path = require('path');
const express = require('express');
const compress = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const uuid = require('node-uuid');
const session = require('express-session');

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


const UPLOADFOLDER =  path.join(__dirname, '../../shareddrive/data/upload');
const CONVERTFOLDER =  path.join(__dirname, '../../shareddrive/data/convert');

const dotenv = require('dotenv');

dotenv.load();




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
    hexinput:[
       {id:16,file:'hex_16.hex',webid:'hex16'},
       {id:4,file:'hex_4.hex',webid:'hex4'},
      // {id:1,file:'hex_1.hex',webid:'hex1'}
       ],
  },
  get folder(){return this.options.folder},
  get hexinput(){return this.options.hexinput},
  get meitinput(){return this.options.meitinput},
  get sqltemplate(){return this.options.sqltemplate;},
  construct:function(){
    const self=this;
    const app = this.app = express();
    // app.use(cors());
    // app.use(compress()); 
    // app.use(bodyParser.json());
    // app.use(bodyParser.urlencoded({ extended: true }));
    // app.use(cookieParser());
    app.use(express.static(path.join(__dirname, '../public')));
    
    let sess = {
        genid: function(req) {return uuid.v1();},
        secret: '123456789',
        resave:true,
        saveUninitialized: true,
        cookie: {}
    };

    // app.use(session(sess));
    
    app.get('/', (req, res) => {
      res.sendFile(path.resolve(__dirname, '../public/index.html'));
    });
    this.dataserver = new DataServer(this.pointer);
    // this.mbtileserver = new MBTileServer(this.pointer);
    this.socketserver = new Socket(this.pointer,{});

    self.startServer();  


  },
  startServer:function(){
    const PORT = 8080;
    this.server.listen(PORT, function() {
      console.log('EC-MEIT app listening on port %d!',PORT);
    });
  },
};

module.exports = WebServer;