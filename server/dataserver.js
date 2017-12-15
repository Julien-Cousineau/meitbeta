const path = require('path');
const UPLOADFOLDER =  path.join(__dirname, '../data/upload');
const CONVERTFOLDER =  path.join(__dirname, '../data/convert');
const SCHEMAFOLDER =  path.join(__dirname, '../data/schema');
const CONVERT = require('./convert');
const IP = process.env.IP;
const mongodatabase = "meitdata";
const mongourl = "mongodb://" + IP +":27017/" + mongodatabase;
const collectionconvert="convert";
const collectiontable="table";
var formidable = require('formidable');
const util = require('./util');
const MapDServer = require("./mapdserver");





const async = require("async");
const fs = require('fs');
const prettyBytes = require('pretty-bytes');
var MongoClient = require('mongodb').MongoClient;

function DataServer(parent,options){
  // parent,options
    this._parent = parent;
    const self=this;
    this.pointer = function(){return self;};
    this.options = util.extend(Object.create(this.options), options);
    this.mapdserver = new MapDServer(this.pointer)
    this.construct();
}
DataServer.prototype = {
  options:{web:true
  },
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  construct:function(){
    if(this.options.web)this.postfile();
    if(this.options.web)this.postfilelist();
  },
  postfile:function(){
    const self=this;
    
    self.parent.app.post('/upload', function(req, res){

      // create an incoming form object
      var form = new formidable.IncomingForm();
    
      // specify that we want to allow the user to upload multiple files in a single request
      form.multiples = true;
    
      // store all uploads in the /uploads directory
      form.uploadDir = path.join(__dirname, '../data/upload');
    
      // every time a file has been uploaded successfully,
      // rename it to it's orignal name
      form.on('file', function(field, file) {
        const filepath = self.getfilepath(form.uploadDir,file);
        fs.renameSync(file.path, filepath);
        self.insert(filepath,function() {});
      });
    
      // log any errors that occur
      form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
      });
    
      // once all the files have been uploaded, send a response to the client
      form.on('end', function() {
        res.end('success');
      });
    
      // parse the incoming request containing the form data
      form.parse(req);
    
    });
  },
  getfilepath:function(folder,file){
    let filepath = path.join(folder, file.name)
    if (fs.existsSync(filepath)){
      let ext = path.extname(file.name);
      let name = file.name.substr(0, file.name.lastIndexOf('.'));
          
      for (let i = 1; i < 100; i++) {
        let newname = name + "." + i + ext;
        filepath = path.join(folder, newname);
        if (!(fs.existsSync(filepath))){
          return filepath
        }
      }
    } else {
      return filepath;
    }
    
  },
  postfilelist:function(){
    const self=this;
    self.parent.app.post('/uploadList', function(req, res){
      self.fileList(function(result){
        const list = JSON.stringify(result);
        // console.log(list)
        res.status(200).send(list);        
      })

    });
    
  },
  getFilesandDatasets:function(dataset,callback){
    const self=this;
    this.fileList(function(err,list){
      if (err) throw err;
      // self.datasetExist(dataset.name,function(err,results){
        // if (err) throw err;
        // const dataset = results[0];
        
        let newlist = list.map(item=>{
          if(item.datasetids.map(item=>item.toString()).includes(dataset._id.toString())){
            item.inside=true;
          } else{item.inside=false;}
          return item;
        });
        
        callback(false,newlist);
      });
    // });
  },
  setDatasetFileids:function(obj,maincallback){
    const datasetname = obj.dataset.name;
    const filename = obj.name;
    // console.log(datasetname)
    MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase);
      dbase.collection(collectionconvert).findOne({ name: filename }, function(err, file) {
        if (err) throw err;
        dbase.collection(collectiontable).findOne({ name: datasetname }, function(err, dataset) {
          if (err) throw err;
          console.log(file.datasetids)
          dbase.collection(collectionconvert).updateOne({ name: file.name }, { $push: { datasetids: dataset._id } }, function(err, res) {
            if (err) throw err;
            dbase.collection(collectiontable).updateOne({ name: dataset.name }, { $push: { fileids: file._id } }, function(err, res) {
              if (err) throw err;
              db.close();
              const meta={action:"done"}
              maincallback(false,meta);
            });
          });
        });
      });
    });
    
    
    
  },
  fileList:function(callback){
     MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase); //here
      dbase.collection(collectionconvert).find({parentid:null}).toArray(function(err, result) {
        if (err) throw err;
        db.close();
        callback(err,result);
      });
    });   
  },  
  processFile:function(obj,callback){
    const self=this;
    const filename = obj.name;
    const input = path.resolve(UPLOADFOLDER,filename);
    const output = path.resolve(CONVERTFOLDER,filename +"2");
    const options={
      csvinput:[input],
      csvoutput:[output],
      printfunc:function(opt){callback(false,opt)},
    };
    new CONVERT(options,function(meta){
      console.log("here here")
      self.insert(output,function(){
        self.setids(input,output,function(){
          meta.action="convert done";
          callback(false,meta);
        });
      });

    });
  },
  uploadtodatabase:function(file,dataset,callback){
    const self=this;
    self.getConvertedFile(file,function(err,cfile){
      if (err) throw err;
      self.mapdserver.copyData(dataset.name,cfile.filepath,function(err,results){
        const meta = {action:"upload done",data:results}
        callback(err,meta);
      });
    });
    
    
    
  },
  getConvertedFile:function(file,callback){
    MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase);
      dbase.collection(collectionconvert).findOne({ childid: file.childid }, function(err, child) {
        callback(err,child);
      });
    });
    
  },
  isconverted:function(obj,callback){
    let meta={action:'0'};
    if(obj.childid){meta.action="convert done";callback(false,meta)}
    else{
      this.processFile(obj,function(err,meta){
        callback(err,meta);
      });
    }
  },
  setids:function(parentpath,childpath,callback){
    const childname =this.getfileinfo(childpath).name;
    const parentname =this.getfileinfo(parentpath).name;
    // console.log("setids")
    MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase);
      dbase.collection(collectionconvert).findOne({ name: parentname }, function(err, parent) {
        if (err) throw err;
        dbase.collection(collectionconvert).findOne({ name: childname }, function(err, child) {
          if (err) throw err;
          dbase.collection(collectionconvert).updateOne({ name: parent.name }, { $set: { childid: child._id } }, function(err, res) {
            if (err) throw err;
            dbase.collection(collectionconvert).updateOne({ name: child.name }, { $set: { parentid: parent._id } }, function(err, res) {
              if (err) throw err;
              db.close();  
              callback(false);
            });
          });
        });
      });
    });    
  },
  insert:function(filepath,callback){
    // obj:name,filepath,size,datecreated,child=false,parentid=null,nrows=null,spatialindex={region:id,prov:id,hex16:id,hex4:id,hex1:id},shipindex=[id1,id2]
    const obj = this.getfileinfo(filepath);
    MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase);
      dbase.collection(collectionconvert).insertOne(obj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
        callback();
      });
    });    
  },
  deletefile:function(obj,callback){
    // console.log(obj.filepath)
    if (fs.existsSync(obj.filepath))fs.unlinkSync(obj.filepath);
    MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase);
      var myquery = { name: obj.name };
      dbase.collection(collectionconvert).deleteMany(myquery,function(err, result) {
        if (err) throw err;
        db.close();
        callback();
      });
    });   
  },
  getfileinfo:function(filepath){
      const name        = path.basename(filepath);
      const stats       = fs.statSync(filepath);
      const size        = prettyBytes(stats.size);
      const datecreated = stats.atime;
      return {
        name:name,
        filepath:filepath,
        size:size,
        datecreated:datecreated,
        childid:null,
        parentid:null,
        datasetids:[],
      };
  },
  getdatasets:function(callback){
    MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase);
      dbase.collection(collectiontable).find({}).toArray(function(err, result) {
        callback(err,result);
      });
   });
  },
  datasetExist:function(name,callback){
     MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase);
      dbase.collection(collectiontable).find({ name: name }).toArray(function(err, result) {
        callback(err,result);
      });
     });
  },
  // newDataset:function(maincallback){
  //   const self=this;
  //   let name;
  //   const datasetExist = function(i,callback){
  //     name = "table" + i;
  //     self.datasetExist(name,function(err,result){
  //       if(err) throw Error(result);
          
  //       if(result.length===0){callback(null,name);}
  //       else{callback(null,false);}
  //     });
  //   };
      
      
  //   async.someSeries(util.range(100), datasetExist, function(err, result) {
  //     if (err) throw err;
  //     console.log(name)
  //     MongoClient.connect(mongourl, function(err, db) {
  //       if (err) throw err;
          
  //       const obj={name:name,datecreated:new Date().toISOString()};
  //       const dbase = db.db(mongodatabase);
  //       dbase.collection(collectiontable).insertOne(obj, function(err, res) {
  //         if (err) throw err;
  //         console.log("1 document inserted");
  //         db.close();
  //         self.getdatasets(function(err,results){
  //           maincallback(err,results);  
  //         });
  //       })
  //     });
  //   });
  // },
  newDataset:function(name,maincallback){
    const self=this;
    const schemafilepath=path.resolve(SCHEMAFOLDER,"template1.sql");
    
    
    self.datasetExist(name,function(err,result){
      if(err) throw Error(result);
      if(result.length!==0){maincallback(true,"Dataset exist!");}
      else{
        self.mapdserver.createTable(name,schemafilepath,function(err,results){
          if(err){maincallback(err,results);return;}  
          MongoClient.connect(mongourl, function(err, db) {
            if (err) throw err;
            const obj={
                      name:name,
                      datecreated:new Date().toISOString(),
                      fileids:[],
            };
            const dbase = db.db(mongodatabase);
            dbase.collection(collectiontable).insertOne(obj, function(err, res) {
              if (err) throw err;
              console.log("1 document inserted");
              db.close();
              self.getdatasets(function(err,results){
                maincallback(err,results);  
              });
            });
          });
        })
      }
    });
  },  
  deletedataset:function(obj,callback){
    const self=this;
    self.mapdserver.dropTable(obj.name,function(err,results){
      if(err){callback(err,results);return;}
      MongoClient.connect(mongourl, function(err, db) {
        if (err) throw err;
        var dbase = db.db(mongodatabase);
        var myquery = { name: obj.name };
        dbase.collection(collectiontable).deleteMany(myquery,function(err, result) {
          if (err) throw err;
          db.close();
          self.getdatasets(function(err,results){
            callback(err,results);  
          });
        });
      });  
    });
  
    
    
    
  },

};
module.exports = DataServer;