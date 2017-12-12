const path = require('path');

const CONVERTFOLDER =  path.join(__dirname, '../data/convert');
const IP = process.env.IP;
const fs = require('fs');
const Connector = require("node-connector")


function MapDServer(parent){
  // parent,options
    this._parent = parent;

    this.construct();
}
MapDServer.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  construct:function(){
    
  },
  connect:function(callback){
    const connector = new Connector()
    connector
      .host("localhost")
      .port("9092")
      .dbName("mapd")
      .user("mapd")
      .password("HyperInteractive")
      .connect((err, results) => { // eslint-disable-line consistent-return
          callback(err,connector);
        });
  },
  query:function(query,options,callback){
    this.connect(function(err,con){
      if(err){callback(err,con);return;}
      con.query(query, options, function(err, result) {
        callback(err,result);
      });
    });
  },
  createTable:function(tablename,filepath,callback){
    let query = fs.readFileSync(filepath, 'utf8').replace("tablename",tablename);
    this.query(query,{},function(err,result){
       callback(err,result);
    });
  },
  getTables:function(callback){
    this.connect(function(err,con){
      if(err){callback(err,con);return;}
      con.getTablesAsync(function(err,result){
        callback(err,result);
      });
    });
  },
  copyData:function(tablename,csvpath,callback){
    let query = "copy {0} from '{1}'".format(tablename,csvpath);
    this.query(query,{},function(err,result){
       callback(err,result);
    });
  },
        

};
  