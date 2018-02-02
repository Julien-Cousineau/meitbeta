const path = require('path');
const UPLOADFOLDER =  path.join(__dirname, '../../shareddrive/data/upload');
const CONVERTFOLDER =  path.join(__dirname, '../../shareddrive/data/convert');
const SCHEMAFOLDER =  path.join(__dirname, '../../shareddrive/data/schema');
const CONVERT = require('./convert');
const IP = process.env.IP;
const mongodatabase = "meitdata";
const mongourl = "mongodb://localhost:27017/" + mongodatabase;
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
  get sqltemplate(){return this.parent.sqltemplate;},
  construct:function(){
    if(this.options.web)this.postfile();
    if(this.options.web)this.postfilelist();
    this.createTables();
  },
  createTables:function(){
    this.files=new FileTable(this.pointer,function(){});
    this.converts=new ConvertTable(this.pointer,function(){});
    this.datasets=new DatasetTable(this.pointer,function(){});
  },
  postfile:function(){
    const self=this;
    
    self.parent.app.post('/upload', function(req, res){

      // create an incoming form object
      var form = new formidable.IncomingForm();
    
      // specify that we want to allow the user to upload multiple files in a single request
      form.multiples = true;
    
      // store all uploads in the /uploads directory
      form.uploadDir = UPLOADFOLDER;
    
      // every time a file has been uploaded successfully,
      // rename it to it's orignal name
      form.on('file', function(field, file) {
        const filepath = self.getfilepath(form.uploadDir,file);
        fs.renameSync(file.path, filepath);
        self.files.add(filepath,function() {});
        // self.insert(filepath,function() {});
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
  // getFilesandDatasets:function(dataset,callback){
  //   const self=this;
  //   this.fileList(function(err,list){
  //     if (err) throw err;
  //     // self.datasetExist(dataset.name,function(err,results){
  //       // if (err) throw err;
  //       // const dataset = results[0];
        
  //       let newlist = list.map(item=>{
  //         if(item.datasetids.map(item=>item.toString()).includes(dataset._id.toString())){
  //           item.inside=true;
  //         } else{item.inside=false;}
  //         return item;
  //       });
        
  //       callback(false,newlist);
  //     });
  //   // });
  // },
  // setDatasetFileids:function(obj,maincallback){
  //   const datasetname = obj.dataset.name;
  //   const filename = obj.name;
  //   // console.log(datasetname)
  //   MongoClient.connect(mongourl, function(err, db) {
  //     if (err) throw err;
  //     var dbase = db.db(mongodatabase);
  //     dbase.collection(collectionconvert).findOne({ name: filename }, function(err, file) {
  //       if (err) throw err;
  //       dbase.collection(collectiontable).findOne({ name: datasetname }, function(err, dataset) {
  //         if (err) throw err;
  //         console.log(file.datasetids)
  //         dbase.collection(collectionconvert).updateOne({ name: file.name }, { $push: { datasetids: dataset._id } }, function(err, res) {
  //           if (err) throw err;
  //           dbase.collection(collectiontable).updateOne({ name: dataset.name }, { $push: { fileids: file._id } }, function(err, res) {
  //             if (err) throw err;
  //             db.close();
  //             const meta={action:"done"}
  //             maincallback(false,meta);
  //           });
  //         });
  //       });
  //     });
  //   });
    
    
    
  // },
  // fileList:function(callback){
  //   MongoClient.connect(mongourl, function(err, db) {
  //     if (err) throw err;
  //     var dbase = db.db(mongodatabase); //here
  //     dbase.collection(collectionconvert).find({parentid:null}).toArray(function(err, result) {
  //       if (err) throw err;
  //       db.close();
  //       callback(err,result);
  //     });
  //   });   
  // },  
  // processFile:function(obj,callback){
  //   const self=this;
  //   const filename = obj.name;
  //   const input = path.resolve(UPLOADFOLDER,filename);
  //   const datasetname = obj.dataset.name;
  //   const newfile = path.parse(input).name + "." + datasetname +".csv2";
  //   console.log(newfile)
  //   const output = path.resolve(CONVERTFOLDER,newfile);
  //   const options={
  //     csvinput:[input],
  //     csvoutput:[output],
  //     printfunc:function(opt){callback(false,opt)},
  //   };
  //   new CONVERT(options,function(meta){
  //     console.log("here here")
  //     self.insert(output,function(){
  //       self.setids(input,output,obj.dataset,function(){
  //         meta.action="convert done";
  //         callback(false,meta);
  //       });
  //     });

  //   });
  // },
  // uploadtodatabase:function(file,dataset,callback){
  //   const self=this;
  //   self.getConvertedFile(file,function(err,cfile){
  //     if (err) throw err;
  //     self.mapdserver.copyData(dataset.name,cfile.filepath,function(err,results){
  //       const meta = {action:"upload done",data:results}
  //       callback(err,meta);
  //     });
  //   });
    
    
    
  // },
  // getConvertedFile:function(file,callback){
  //   MongoClient.connect(mongourl, function(err, db) {
  //     if (err) throw err;
  //     var dbase = db.db(mongodatabase);
  //     dbase.collection(collectionconvert).findOne({ childid: file.childid }, function(err, child) {
  //       callback(err,child);
  //     });
  //   });
    
  // },
  // isconverted:function(obj,callback){
  //   let meta={action:'0'};
  //   if(obj.datasetids.find(item=>item===obj.dataset._id)){
  //     meta.action="convert done";callback(false,meta);
  //   }else{
  //     this.processFile(obj,function(err,meta){
  //       callback(err,meta);
  //     });
  //   }
  // },
  // setids:function(parentpath,childpath,dataset,callback){
  //   const childname =this.getfileinfo(childpath).name;
  //   const parentname =this.getfileinfo(parentpath).name;
  //   // console.log("setids")
  //   MongoClient.connect(mongourl, function(err, db) {
  //     if (err) throw err;
  //     var dbase = db.db(mongodatabase);
  //     dbase.collection(collectionconvert).findOne({ name: parentname }, function(err, parent) {
  //       if (err) throw err;
  //       dbase.collection(collectionconvert).findOne({ name: childname }, function(err, child) {
  //         if (err) throw err;
  //         dbase.collection(collectionconvert).updateOne({ name: parent.name }, { $push: { datasetids: dataset._id } }, function(err, res) {
  //           if (err) throw err;
  //           dbase.collection(collectionconvert).updateOne({ name: child.name }, { $set: { parentid: parent._id } }, function(err, res) {
  //             if (err) throw err;
  //             db.close();  
  //             callback(false);
  //           });
  //         });
  //       });
  //     });
  //   });    
  // },
  // insert:function(filepath,callback){
  //   // obj:name,filepath,size,datecreated,child=false,parentid=null,nrows=null,spatialindex={region:id,prov:id,hex16:id,hex4:id,hex1:id},shipindex=[id1,id2]
  //   const obj = this.getfileinfo(filepath);
  //   MongoClient.connect(mongourl, function(err, db) {
  //     if (err) throw err;
  //     var dbase = db.db(mongodatabase);
  //     dbase.collection(collectionconvert).insertOne(obj, function(err, res) {
  //       if (err) throw err;
  //       console.log("1 document inserted");
  //       db.close();
  //       callback();
  //     });
  //   });    
  // },
  // deletefile:function(obj,callback){
  //   // console.log(obj.filepath)
  //   if (fs.existsSync(obj.filepath))fs.unlinkSync(obj.filepath);
  //   MongoClient.connect(mongourl, function(err, db) {
  //     if (err) throw err;
  //     var dbase = db.db(mongodatabase);
  //     var myquery = { name: obj.name };
  //     dbase.collection(collectionconvert).deleteMany(myquery,function(err, result) {
  //       if (err) throw err;
  //       db.close();
  //       callback();
  //     });
  //   });   
  // },
  // getfileinfo:function(filepath){
  //     const name        = path.basename(filepath);
  //     const stats       = fs.statSync(filepath);
  //     const size        = prettyBytes(stats.size);
  //     const datecreated = stats.atime;
  //     return {
  //       name:name,
  //       filepath:filepath,
  //       size:size,
  //       datecreated:datecreated,
  //       parentid:null,
  //       datasetids:[],
  //     };
  // },
  // getList:function(callback){
  //   MongoClient.connect(mongourl, function(err, db) {
  //     if (err) throw err;
  //     var dbase = db.db(mongodatabase);
  //     dbase.collection(collectiontable).find({}).toArray(function(err, result) {
  //       callback(err,result);
  //     });
  // });
  // },
  // datasetExist:function(name,callback){
  //   MongoClient.connect(mongourl, function(err, db) {
  //     if (err) throw err;
  //     var dbase = db.db(mongodatabase);
  //     dbase.collection(collectiontable).find({ name: name }).toArray(function(err, result) {
  //       callback(err,result);
  //     });
  //   });
  // },
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
  // newDataset:function(name,maincallback){
  //   const self=this;
  //   const schemafilepath=path.resolve(SCHEMAFOLDER,"template1.sql");
    
    
  //   self.datasetExist(name,function(err,result){
  //     if(err) throw Error(result);
      
  //     if(result.length!==0){maincallback(true,"Dataset exist!");}
  //     else{
  //       console.log("inside here")
  //       self.mapdserver.createTable(name,schemafilepath,function(err,results){
  //         console.log(err)
  //         if(err){maincallback(err,results);return;}  
  //         MongoClient.connect(mongourl, function(err, db) {
  //           if (err) throw err;
  //           const obj={
  //                     name:name,
  //                     datecreated:new Date().toISOString(),
  //                     fileids:[],
  //           };
  //           const dbase = db.db(mongodatabase);
  //           dbase.collection(collectiontable).insertOne(obj, function(err, res) {
  //             if (err) throw err;
  //             console.log("1 document inserted");
  //             db.close();
  //             self.getdatasets(function(err,results){
  //               maincallback(err,results);  
  //             });
  //           });
  //         });
  //       })
  //     }
  //   });
  // },  
  // deletedataset:function(obj,callback){
  //   const self=this;
  //   self.mapdserver.dropTable(obj.name,function(err,results){
  //     if(err){callback(err,results);return;}
  //     MongoClient.connect(mongourl, function(err, db) {
  //       if (err) throw err;
  //       var dbase = db.db(mongodatabase);
  //       var myquery = { name: obj.name };
  //       dbase.collection(collectiontable).deleteMany(myquery,function(err, result) {
  //         if (err) throw err;
  //         db.close();
  //         self.getdatasets(function(err,results){
  //           callback(err,results);  
  //         });
  //       });
  //     });  
  //   });
  
    
    
    
  // },

};



function Table(name,callback){
  this.name=name;
  this.create(function(){callback();});
}
Table.prototype ={
  exist:function(callback){
    const name=this.name;
    MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase); //here
      dbase.listCollections().toArray(function(err, collections) {
        if (err) throw err;
        callback(null, collections.some(function(coll) {
          return coll.name == name;
        }));
      });
    });
  },
  create:function(callback){
    const name=this.name;
    this.exist(function(err,exist){
      if (err) throw err;
      if(exist)return callback(false);
      MongoClient.connect(mongourl, function(err, db) {
        if (err) throw err;
        var dbase = db.db(mongodatabase); //here
        dbase.createCollection(name, function(err, result) {
          if (err) throw err;
          db.close();
          callback(err,result);  
        });
      });
    });
  },
  delete:function(callback){
    const name=this.name;
    MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase);
      dbase.collection(name).drop(function(err, result) {
        callback(err,result);
      });
   });
  },
  find:function(att,obj,callback){
    const name=this.name;
    MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase); //here
      const findobj={};findobj[att]=obj[att];
      dbase.collection(name).find(findobj).toArray(function(err, result) {
        if (err) throw err;
        db.close();
        callback(err,result);
      });
    });
  },
  rowExist:function(obj,callback){
    this.find('name',obj,function(err,result){
      if (err) throw err;
      if(result.length===0){callback(false,false)}
      else{callback(false,true)}
    })
  },
  getList:function(callback){
    const name=this.name;
    MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase);
      dbase.collection(name).find({}).toArray(function(err, result) {
        if(result.length>0)result.forEach(item=>item.id=item.name);
        callback(err,result);
      });
   });
  },
  _add:function(obj,callback){
    console.log("Table _add")
    const name=this.name;
    MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase);
      dbase.collection(name).insertOne(obj, function(err, res) {
        if (err) throw err;
        db.close();
        callback(err,obj);
      });
      
    });   
    
  },
  _remove:function(obj,callback){
    const name=this.name;
    const myquery = { name: obj.name };
    MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase);
      dbase.collection(name).deleteMany(myquery,function(err, result) {
        if (err) throw err;
        db.close();
        callback(err,result);
      });
    });
  },
  update:function(myquery,_set,callback){
    const name=this.name;
    MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase);
      dbase.collection(name).updateMany(myquery, _set,function(err, result) {
        if (err) throw err;
        db.close();
        callback(err,result);
      });
    });
  },
  _push:function(att,obj,callback){
    const pushobj={};pushobj[att]=obj[att];
    const name=this.name;
    const myquery = { name: obj.dataset };
    MongoClient.connect(mongourl, function(err, db) {
      if (err) throw err;
      var dbase = db.db(mongodatabase);
      dbase.collection(name).updateOne(myquery,{ $push: pushobj },function(err, result) {
        if (err) throw err;
        db.close();
        callback(err,result);
      });
    });
      //         dbase.collection(collectionconvert).updateOne({ name: parent.name }, { $push: { datasetids: dataset._id } }, function(err, res) {
  //           if (err) throw err;
  //           dbase.collection(collectionconvert).updateOne({ name: child.name }, { $set: { parentid: parent._id } }, function(err, res) {
  //             if (err) throw err;
  //             db.close();  
  //             callback(false);
  //           });
  //         });
  }
};

// delete:function(callback){
//     const self=this;
//     const name = this.name;
//     self.mapdserver.dropTable(name,function(err,results){
//       if(err){callback(err,results);return;}
//       MongoClient.connect(mongourl, function(err, db) {
//         if (err) throw err;
//         var dbase = db.db(mongodatabase);
//         var myquery = { name:name };
//         dbase.collection(collectiontable).deleteMany(myquery,function(err, result) {
//           if (err) throw err;
//           db.close();
//           callback(err,result);
//         });
//       });  
//     });  
//   },

function FileTable(parent,callback){
  this._parent=parent;
  Table.call(this,'ofiles',function(){callback();});
}
FileTable.prototype={
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get converts(){return this.parent.converts;},
  add:function(filepath,callback){
    const self=this;
    console.log("FileTable add")
    const name        = path.basename(filepath);
    const stats       = fs.statSync(filepath);
    const size        = prettyBytes(stats.size);
    const datecreated = stats.atime;
    const obj         =
    { name:name,
      filepath:filepath,
      size:size,
      datecreated:datecreated,
    };
    self.rowExist(obj,function(err,con){
      console.log(con)
      if(err)console.log("Error in rowExist")
      if(con){callback(true,"File Already Exist!");return;}
      self._add(obj,callback);
    })
  },
  remove:function(obj,callback){
    if (fs.existsSync(obj.filepath))fs.unlinkSync(obj.filepath);
    this._remove(obj,function(err,result){callback(err,result);});
    console.log(obj)
    this.converts.remove('parentname',obj,function(err,result){callback(err,result)})
    
  }
};
Object.assign(FileTable.prototype,Table.prototype);
FileTable.prototype.constructor = FileTable;
function ConvertTable(parent,callback){
  this._parent=parent;
  Table.call(this,'cfiles',function(){callback();});
}
ConvertTable.prototype={
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get sqltemplate(){return this.parent.sqltemplate.split(".sql")[0];},
  get mapdserver(){return this.parent.mapdserver},
  get datasetstable(){return this.parent.datasets},
  add:function(obj,callback){
    const self=this;
    const input = path.resolve(UPLOADFOLDER,obj.name);
    const dataset = obj.dataset.name
    // const datasetname = obj.dataset.name;
    // const newfile = path.parse(input).name + "." + datasetname +".csv2";
    const newfile = path.parse(input).name + "." +  this.sqltemplate +".csv2";

    const output = path.resolve(CONVERTFOLDER,newfile);
    const testing= obj.testing || false;
    const options={
      csvinput:[input],
      csvoutput:[output],
      testing:testing,
      printfunc:function(err,opt){callback(err,opt)},
    };
    console.log(newfile)
    this.rowExist({name:newfile},function(err,con){
      console.log(con)
      if(err)console.log(con);
      if(con){
        self.datasetadd(dataset,newfile);
        self.mapdadd(dataset,output,callback);
      }
      else{
        new CONVERT(options,function(meta){
          console.log("adding to mongo");
          self.mongoadd(output,obj.name,function(err,result){
            if(err)console.log(result);
            self.datasetadd(dataset,newfile);
            self.mapdadd(dataset,output,callback);
          });
        });
      }
    });
  },
  datasetadd:function(dataset,filename){
    this.datasetstable.addData(dataset,filename,()=>null);
  },
  mapdadd:function(dataset,output,callback){
    const self=this;
    let meta ={};
    meta.action="optimization";
    callback(false,meta);
    self.mapdserver.copyData(dataset,output,function(err,results){
      if(err)console.log(results);
      meta = {action:"upload done",data:results};
      callback(err,meta);
    });
  },
  mongoadd:function(filepath,parentname,callback){
    
    const name        = path.basename(filepath);
    const stats       = fs.statSync(filepath);
    const size        = prettyBytes(stats.size);
    const datecreated = stats.atime;
    const schema      = this.sqltemplate // TODO: Change this to user preference
    const obj         =
    { name:name,
      filepath:filepath,
      size:size,
      datecreated:datecreated,
      parentname:parentname,
      // datasetname:datasetname,
      schema:schema
    };
    this._add(obj,function(err,result){
      callback(err,result);
    });
  },
  remove:function(key,obj,callback){
    const self=this;
    console.log("remove convert")
    this.find(key,{parentname:obj.name},function(err,results){
      if(err)throw Error(results);
      const func = function(item,_callback){
        console.log(item.filepath)
        if (fs.existsSync(item.filepath))fs.unlinkSync(item.filepath);
        self._remove(item,function(){_callback();}); 
      };
      async.each(results,func, function() {
        callback();
      });
    });
    
  }
};
Object.assign(ConvertTable.prototype,Table.prototype);
ConvertTable.prototype.constructor = ConvertTable;

function DatasetTable(parent,callback){
  this._parent=parent;
  Table.call(this,'datasets',function(){callback();});
}
DatasetTable.prototype= {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get sqltemplate(){return this.parent.sqltemplate;},
  get filestable(){return this.parent.files},
  get convertstable(){return this.parent.converts},
  get mapdserver(){return this.parent.mapdserver},
  add:function(name,callback){
    const self=this;
    console.log(this.sqltemplate)
    const schemafilepath=path.resolve(SCHEMAFOLDER,this.sqltemplate);
    
    self.rowExist({name:name},function(err,exist){
      if(err)return callback(err);
      if(exist)return callback(true,"Dataset exist!");
      self.mapdserver.createTable(name,schemafilepath,function(err,results){
        if(err)return callback(err,results); 
        self.getList(function(err,array){
          const isdefault=(array.length>0)?false:true;
          const obj =
            { name:name,
              data:[],
              default:isdefault,
              datecreated:new Date().toISOString(),
            };
          self._add(obj,function(err,result){callback(err,result);});          
        });
      });
    });
  },
  addData:function(dataset,filename,callback){
    console.log(dataset,filename)
    this._push('data',{dataset:dataset,data:filename},callback);
  },
  remove:function(obj,callback){
    const self=this;
    self.mapdserver.dropTable(obj.name,function(err,results){
      console.log(obj.name,err,results);
      if(err)return callback(err,results);
      self._remove({name:obj.name},function(err,result){
        // console.log(obj.name)
        // self.convertstable.remove('datasetname',{datasetname:obj.name},function(err,result){callback(err,result)})
        callback(err,result);}
      );  
    });  
  },
  changeDefault:function(datasetname,callback){
    const self=this;
    console.log(datasetname)
    self.update({},{ $set: {'default' : false } },()=>{
      self.update({name:datasetname},{ $set: {'default' : true } },callback);
    });
    
  },
  getView:function(datasetname,callback){
    const self=this;
    self.filestable.getList(function(err,files){
      if (err) throw err;
      self.getList(function(err,datasets){
        if (err) throw err;
        const datasetobj = datasets.find(dataset=>dataset.name===datasetname)
        files.map(file=>{
          const file2 = file.name.split('.csv')[0] + "." +  self.sqltemplate.split('.sql')[0] +".csv2"
          file.inside=datasetobj.data.includes(file2)
        })
        callback(false,files);
      })
    });
    
  },
};
Object.assign(DatasetTable.prototype,Table.prototype);
DatasetTable.prototype.constructor = DatasetTable;
module.exports = DataServer;
