const path = require('path');
const DataServer = require('./dataserver');
const CONVERT = require('./convert');
const UPLOADFOLDER =  path.join(__dirname, '../data/upload');
const CONVERTFOLDER = path.join(__dirname, '../data/convert');

const CONSTANTS= require('./convert/constants');
const EMISSIONS= CONSTANTS.EMISSIONS;
const YEARS= CONSTANTS.YEARS;
const Ship = require('./convert/ship');
const async = require('async');
const MapDServer = require("./mapdserver");

// const filename='dummy.csv';
// const filename='arcticWIG_09212017.csv';
// const filename='pacific_emissions_11162017.csv';
const filename='east_arctic_emissions_10252017.csv';

function ManualInsert(){
    const self=this;
    this.pointer = function(){return self;};
    const dataserver = new DataServer(this.pointer,{web:false});
    const filepath = path.resolve(UPLOADFOLDER,filename);
    // dataserver.files.delete(function(){
    //   dataserver.files.create(function(){
    //     dataserver.files.add(filepath,function(){
    //       console.log("Done")
    //     })
    //   });  
    // });
    dataserver.files.add(filepath,function(){console.log("Done")});
    // dataserver.converts.add({name:"dummy.csv",dataset:{name:'test6'},htmlid:""},function(err,meta){
      // console.log(meta)
    // });
    // dataserver.files.delete(function(){});
    // dataserver.converts.delete(function(){});
    // dataserver.datasets.delete(function(){});
    
    // dataserver.files.getList(function(err,result){console.log(result)})
    
    // dataserver.converts.getList(function(err,result){console.log(result)})
    
    // dataserver.datasets.getList(function(err,list){console.log(list);})
    
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
