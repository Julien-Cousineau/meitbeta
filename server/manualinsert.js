const path = require('path');
const DataServer = require('./dataserver');
const CONVERT = require('./convert');
const UPLOADFOLDER =  path.join(__dirname, '../../shareddrive/data/upload');
const CONVERTFOLDER = path.join(__dirname, '../../shareddrive/data/convert');

const CONSTANTS= require('./convert/constants');
const EMISSIONS= CONSTANTS.EMISSIONS;
const YEARS= CONSTANTS.YEARS;
const Ship = require('./convert/ship');
const async = require('async');
const MapDServer = require("./mapdserver");

// const filename='dummy.csv';
// const filename='arcticWIG_09212017.csv';
// const filename='pacific_emissions_11162017.csv';

// const filename='east_emissions_2018-01-17.csv';
// const filename = 'pacificWIG_07192017.csv'
// const filename='arctic_emissions_01102018.csv';
// const filename='eastWIG_09212017.csv';
// const filename='pacificWIG_09212017.csv';
// const filename='pacific_emissions_01042018.csv';
// const filename='pacific_emissions_11162017.csv';

function ManualInsert(){
    const self=this;
    this.pointer = function(){return self;};
    const dataserver = this.dataserver=new DataServer(this.pointer,{web:false});
    
    this.addFilesManually();
    
    // this.TestAll();
    // this.deleteAll(()=>null)
    // this.deleteConvert();
    // this.getListAll()
    
    // this.addTestFile(()=>null);
    // this.addTestDataset('test2',()=>null);
    // this.addTestConvertFile(()=>null);
    // this.addConvertFile(()=>null);
    
    // this.TestingPush();
    // this.TestingGetView();
    // this.TestingDeleteFile();
    // this.TestingchangeDefault(()=>self.getDListAll());
    // this.TestingPublicDefault(()=>self.getDListAll());
    
    // dataserver.files.delete(function(){
    //   dataserver.files.create(function(){
    //     dataserver.files.add(filepath,function(){
    //       console.log("Done")
    //     })
    //   });  
    // });
    
    // dataserver.files.add(filepath,function(){console.log("Done")});
    
    // dataserver.converts.add({name:filename,dataset:{name:'table6'},htmlid:""},function(err,meta){
    //   // console.log(meta)
    // });


    
    // dataserver.datasets.getView({name:'test7'},function(err,list){console.log(list);})
    
    // dataserver.datasets.add("test6",function(err,results){
    //   console.log("Done")
    // })
    
    
    
    

    // dataserver.datasets.remove("test8",function(err,results){
      // console.log("Done")
    // })    
    
    // dataserver.datasets.getList(function(err,result){
    //   console.log(result)
    // })
    
    
  return
}
ManualInsert.prototype = {
  sqltemplate: "template2.sql",
  testdataset:'test1',
  testfile:'dummy.csv',
  deleteConvert:function(){
    this.dataserver.converts.delete(function(){});
  },
  deleteAll:function(callback){
    this.dataserver.files.delete(()=>this.dataserver.converts.delete(()=>this.dataserver.datasets.delete(callback)));
  },
  getDListAll:function(){this.dataserver.datasets.getList(function(err,list){console.log(list);})},
  getListAll:function(){
    this.dataserver.files.getList(function(err,result){console.log(result)})
    this.dataserver.converts.getList(function(err,result){console.log(result)})
    this.getDListAll();
  },
  addFilesManually:function(){
    const files=[
      //'arctic_emissions_01102018.csv',
      //'pacific_emissions_01042018.csv',
      //'east_emissions_2018-01-17.csv',            
      // 'pacific_emissions_01042018.csv',
      // 'pacificWIG_07192017.csv',
      // 'eastWIG_09212017.csv',
      // 'pacificWIG_09212017.csv',
      // 'pacific_emissions_11162017.csv',
      'arcticWIG_09212017.csv'
      ];
    files.forEach(file=>{
      const filepath = path.resolve(UPLOADFOLDER,file);
      this.dataserver.files.add(filepath,function(){console.log(file, "Done!")});      
    });
  },
  addTestFile:function(callback){
    const filepath = path.resolve(UPLOADFOLDER,this.testfile);
    this.dataserver.files.add(filepath,function(err,results){if(err){console.log(results);return;};console.log("addTestFile Done!");callback()});
  },
  addTestConvertFile:function(callback){
    this.dataserver.converts.add({name:this.testfile,dataset:{name:this.testdataset},htmlid:"",testing:true},function(err,meta){
      console.log(meta);
      callback();
    });
  },
  addTestDataset:function(_name,callback){
    const name = _name || this.testdataset;
    this.dataserver.datasets.add(name,function(err,results){if(err){console.log(results);return;};console.log("addTestDataset Done!");callback();})
  },
  TestAll:function(){
    this.deleteAll(()=>{
      this.addTestFile(()=>this.addTestDataset(null,()=>this.addTestConvertFile(()=>null)));
    })
    
  },
  TestingPush:function(){
    this.dataserver.datasets.addData(this.testdataset,'dummy.template2.csv2',()=>console.log("TestingPush Done!"))
  },
  TestingGetView:function(){
    this.dataserver.datasets.getView(this.testdataset,(err,files)=>console.log(files))
  },
  TestingDeleteFile:function(){
    const self=this;
    const filepath = path.resolve(UPLOADFOLDER,this.testfile);
    this.dataserver.files.remove({name:this.testfile,parentname:this.testfile},function(){
      self.getListAll();
    });
  },
  TestingchangeDefault:function(callback){
    this.dataserver.datasets.changeDefault('test1',callback)
  },
  TestingPublicDefault:function(callback){
     this.getDListAll();
    this.dataserver.datasets.changePublic('test1',callback)
  }
    
  // addConvertFile:function(){
  //   this.dataserver.converts.add({name:this.testfile,dataset:{name:this.testdataset},htmlid:"",testing:true},function(err,meta){
  //     console.log(meta);callback();
  //   });
  // }
  
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

function readSHIP(){
  const self=this;
  this.pointer = function(){return self;};
  const ship=new Ship(this.pointer)
  const shipinput=[
     {id:0,file:'pacific_growth_factors_11212017.csv'},
     {id:1,file:'east_arctic_greatlakes_growth_factors_11212017.csv'}
     ]
  const folder ='data/ship'
  const funcShip =function(input,ccallback){
      ship.readCSV(path.resolve(folder,input.file),function(e,message){
        if(e)console.log(message);
        ccallback(e,message);
      });
    };
  async.eachSeries(shipinput, funcShip, function(e,message){
    
      let i=0;
      let count=0
      let min=10;
      let max=0;
      // console.log(ship.ships)
      for(let id in ship.ships){
        // if(i===1000){
        for(let ii=0;ii<22;ii++){
        EMISSIONS.forEach((e,ei)=>{
          YEARS.forEach((year)=>{
            let value =ship.ships[id].forecast[year][2][ii][e];
            min=(value<min)?value:min;
            max=(value>max)?value:max;  
          })
          
          // if(ei>0){
            // if(ship.ships[id].forecast[2025][1][4][e] !==ship.ships[id].forecast[2025][1][ii][e]){
              // count++;
              
              // console.log(ship.ships[id].forecast[2020][1][ii].nox)
            // }  
          // }
        })
        
        }  // console.log(ship.ships[id].forecast['2020']['1'])
        // }
        i++;
      }
      console.log(max,min)
        
      
      
  });
  
  
}
new ManualInsert();

// new processFile({name:"arcticWIG_09212017.csv"},function(){})

// new readSHIP()
