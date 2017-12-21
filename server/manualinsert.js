const path = require('path');
const DataServer = require('./dataserver');
const CONVERT = require('./convert');
const UPLOADFOLDER =  path.join(__dirname, '../data/upload');
const CONVERTFOLDER = path.join(__dirname, '../data/convert');

function ManualInsert(){
    const self=this;
    this.pointer = function(){return self;};
    const dataserver = new DataServer(this.pointer,{web:false});
    const filepath = path.resolve(UPLOADFOLDER,"pacific_emissions_11162017.csv")
    dataserver.insert(filepath,function(){
        console.log("Done")
    })
}

function processFile(obj,callback){
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
}

// new ManualInsert();
new processFile({name:"arcticWIG_09212017.csv"},function(){})