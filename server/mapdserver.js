const path = require('path');

const CONVERTFOLDER =  path.join(__dirname, '../data/convert');
const UPLOADFOLDER =  path.join(__dirname, '../data/upload');
const SCHEMAFOLDER =  path.join(__dirname, '../data/schema');
const IP = process.env.IP;
const fs = require('fs');
const Connector = require("./node-connector");

const util = require("./util");


function MapDServer(parent){
  // parent,options
    this._parent = parent;

    // this.construct();
}
MapDServer.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  construct:function(){
    const name="dummy2";
    const schemafilepath=path.resolve(SCHEMAFOLDER,"template1.sql");
    const csv=path.resolve(CONVERTFOLDER,"dummy.csv2");
    // console.log("inside")
    // this.createTable(name,schemafilepath,function(err,result){console.log(result);})
    // this.dropTable(name,function(err,results){if(err)throw Error(results);})
    // this.copyData(name,csv,function(err,result){if(err)throw Error(result);console.log("Done",result)})
    
  },
  connect:function(callback){
    const connector = new Connector()
    connector
      .protocol("http")
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
  createTable:function(tablename,schemafilepath,callback){
    let query = fs.readFileSync(schemafilepath, 'utf8').replace("tablename",tablename);
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
  dropTable:function(tablename,callback){
    const query = "DROP TABLE IF EXISTS {0}".format(tablename);
    this.query(query,{},function(err,result){
       callback(err,result);
    });
  },
};

// new MapDServer();
module.exports = MapDServer;