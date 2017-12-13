const path = require('path');
const express = require('express');
const compress = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const uuid = require('node-uuid');
const session = require('express-session');

const prettyBytes = require('pretty-bytes');
var fs = require('fs');
const http = require('http');
const url = require('url');
// const WebSocket = require('ws');
const socketio = require('socket.io');
const Papa= require('papaparse');

const DataServer = require('./dataserver');


const UPLOADFOLDER =  path.join(__dirname, '../data/upload');
const CONVERTFOLDER =  path.join(__dirname, '../data/convert');






function WebServer(parent){
  this._parent = parent;
  const self=this;
  this.pointer = function(){return self;};
  this.construct();
}
WebServer.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},  
  construct:function(){
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
    // this.dataserver.newTable(function(){
      
    // })
    this.websocketSetup();
    this.startServer();
    
  },
  startServer:function(){
    const PORT = 8080;
    this.server.listen(PORT, function() {
      console.log('EC-MEIT app listening on port %d!',PORT);
    });
  },
  websocketSetup:function(){
    const server = this.server = http.createServer(this.app);
    const io = this.io = socketio(server);
    const self=this;
    io.on('connection', function(socket){
      console.log('a user connected');
      socket.on('convertcsv', function(obj){
        self.dataserver.processFile(obj,function(meta){
          meta.htmlid = obj.htmlid;
          io.emit('convertcsv', meta);
          if(meta.action==="convert done"){
            self.datasetExist(obj.name,function(err,results){
              const newobj = results[0];
              self.dataserver.uploadtodatabase(newobj,function(meta){
                meta.htmlid = obj.htmlid;
                io.emit('convertcsv', meta);
              })
            });
            
          }
        });
        // io.emit('chat message', msg);
      });
      socket.on('getdatasets', function(){
        self.dataserver.getdatasets(function(err,array){
          if(err)console.log("Error on getdatasets")
          const obj={meta:"",data:array}
          console.log(obj)
          io.emit('getdatasets', obj);
        });
        // io.emit('chat message', msg);
      });
      socket.on('getfiles', function(){
        self.dataserver.fileList(function(err,array){
          if(err)console.log("Error on getfiles")
          const obj={meta:'',data:array};
          io.emit('getfiles', obj);
        });
      });
        // io.emit('chat message', msg);
      socket.on('newdataset', function(name){
        self.dataserver.newDataset(name,function(err,results){
          if(err){io.emit('newdataseterror', results);}
          else{
            const obj={meta:'',data:results};
            io.emit('getdatasets', obj);
          }
        });
        // io.emit('chat message', msg);
      });  
      socket.on('getfilesanddatasets', function(dataset){
        // console.log(dataset)
        self.dataserver.getFilesandDatasets(dataset,function(err,array){
          const obj={meta:{dataset:dataset},data:array};
          io.emit('getfilesanddatasets', obj);
        });
        // io.emit('chat message', msg);
      });
      socket.on('addfiledataset', function(obj){
        self.dataserver.isconverted(obj,function(err,meta){
          meta.htmlid = obj.htmlid;
          io.emit('addfiledataset', meta);
          if(meta.action==="convert done"){
            const tempdataset = obj.dataset;
            self.dataserver.datasetExist(tempdataset.name,function(err,results){
              const dataset = results[0];
              self.dataserver.uploadtodatabase(obj,dataset,function(err,meta){
                meta.htmlid = obj.htmlid;
                io.emit('addfiledataset', meta);
                self.dataserver.setDatasetFileids(obj,function(err,meta){
                  meta.htmlid=obj.htmlid;
                  io.emit('addfiledataset', meta);
                });
              });
            });
          }
        });
      });
      

      
      
      socket.on('deletedataset', function(obj){
        self.dataserver.deletedataset(obj,function(err,results){
          if(err)console.log("Error on deletedataset")
          const obj={meta:"",data:results};
          io.emit('getdatasets', obj);
        });
        // io.emit('chat message', msg);
      });  
      socket.on('deletefile', function(obj){
        self.dataserver.deletefile(obj,function(){
          self.dataserver.fileList(function(err,results){
            const obj={meta:"",data:results};
            if(err)console.log("Error on getfiles")
            io.emit('getfiles', obj);
          });
        });
        // io.emit('chat message', msg);
      });
      socket.on('disconnect', function () {
       console.log('a user disconnected');
      });
    });
    
  },
};

module.exports = WebServer;