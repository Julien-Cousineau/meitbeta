const SHIP = require('./ship');
const HEX = require('./hex');
const MEITREGION = require('./meitregion');
const CONSTANTS= require('./constants');
const ENGINES  = CONSTANTS.ENGINES;
// const MODES    = CONSTANTS.MODES;
const EMISSIONS= CONSTANTS.EMISSIONS;
const FIELDS   = CONSTANTS.FIELDS;
const MAPFIELDS= CONSTANTS.MAPFIELDS;
const util     = require('../util');

const fs  = require('fs');
const Papa= require('papaparse');
const path = require('path');
const async = require('async');


function Convert(options,callback){
  const self   = this;
  this.pointer = function(){return self;};
  this.options = util.extend(Object.create(this.options), options);
  this.hex={};
  this.points={};

  this.meta={
    action:null,
    errors:[],
    progress:0,
    readship:0,
    readhex:0,
    time:{},
    steps:{readmeitregion:0,readhex:1,readship:2,readping:3},
  };
  
  this.irow=0;
  this.iping=0;
  this.ipoint=0;
  this.construct(function(){
    callback(self.meta);
  });
}
Convert.prototype = {
  options:{
    folder:{csv:'data/upload',hex:'data/hex',ship:'data/ship',convert:'data/convert'},
    csvinput:[
      //   'dummy.csv',
      // 'arcticWIG_09212017.csv',
      // 'pacificWIG_09212017.csv',
      // 'eastWIG_09122017.csv',
       ],
    csvoutput:['processed.csv'],
    meitinput:'meitregions.geojson',
    hexinput:[
       {id:16,file:'hex_16.hex'},
      {id:4,file:'hex_4.hex'},
      {id:1,file:'hex_1.hex'}
       ],
    shipinput:[
     {id:0,file:'pacific_growth_factors_11212017.csv'},
     {id:1,file:'east_arctic_greatlakes_growth_factors_11212017.csv'}
     ],
    printfunc:function(step,nstep,i){console.log("step {0} of {1}:{2}".format(step,nstep,i))},
  },
  
  get printfunc(){return this.options.printfunc},
  get folder(){return this.options.folder},
  get csvinput(){return this.options.csvinput},
  get csvoutput(){return this.options.csvoutput},
  get hexinput(){return this.options.hexinput},
  get shipinput(){return this.options.shipinput},
  get meitinput(){return this.options.meitinput},
  print:function(){
    this.printfunc(this.meta);
  },
  construct:function(callback){
    const self=this;
    this.constuctMapArrays();
    
    self.loopRegion(function(){
      self.loopHex(function(){
        self.loopShip(function(){
          self.loopCSV(function(){
            util.checkMemory();
            callback();
          });
        });
      });  
    });
    
  },
  constuctMapArrays:function(){
    const size=30000000;
    this.lng=new Float32Array(size);
    this.lat=new Float32Array(size);
    this.mapmeit=new Uint8Array(size);
    this.meit=new Uint8Array(size);
    this.hex_16=new Uint32Array(size);
    this.hex_4=new Uint32Array(size);
    this.hex_1=new Uint32Array(size);
  },
  loopRegion:function(maincallback){
    const self=this;
    const meitregion = this.MEITREGION = new MEITREGION(this.pointer);
    const inputPath = path.resolve(this.folder.hex,this.meitinput);
    meitregion.read(inputPath,function(e,message){
      if(e){self.meta.errors.push(message);self.print();return;}
      meitregion.getIndex();
      maincallback();
    });
  },
  loopShip:function(maincallback){
    const self=this;
    const ship = this.SHIP = new SHIP(this.pointer);
    const funcShip =function(input,callback){
      ship.readCSV(path.resolve(self.folder.ship,input.file),function(e,message){if(e)throw Error(message);callback();});
    };
    async.eachSeries(this.shipinput, funcShip, function(e,message){
      if(e){self.meta.errors.push(message);self.print();return;}
      maincallback();
    });
    
  },
  loopHex:function(maincallback){
    const self=this;
    const funcHex =function(input,callback){
      const hex = self.hex[input.id] = new HEX(self.pointer);
      hex.readHex(input.id,path.resolve(self.folder.hex,input.file),function(e,message){
        if(e){self.meta.errors.push(message);self.print();return;}
        callback();
      });
    };
    async.eachSeries(this.hexinput, funcHex, function(e,message){
      if(e){self.meta.errors.push(message);self.print()}
      maincallback();
    });
    
  },
  loopCSV:function(maincallback){
    const self = this;
    const outstream = fs.createWriteStream(self.csvoutput[0]);
    console.log(path.resolve(self.folder.convert,self.csvoutput[0]))
    const funcCSV =function(input,callback){
      self.readCSV(input,outstream,function(e,message){
        if(e){self.meta.errors.push(message);self.print();return;}
        callback();
      });
    };
    async.eachSeries(this.csvinput, funcCSV, function(e,message){
      if(e){self.meta.errors.push(message);self.print();return;}
      maincallback();
    });
    
  },
  readCSV:function(input,outstream,callback){
    const instream = fs.createReadStream(input);
    console.log(input)
  
    const self=this;
    let tcount=0,count=0;
    self.meta.action='Reading ' + path.basename(input);
    let hrstart = process.hrtime();
    outstream.write(FIELDS.join(",") + "\n");
    Papa.parse(instream, {
      header: true,
      // fastMode:true,
	    step: function(row) {
        if(tcount>=50000){
          self.meta.progress=row.meta.cursor / instream.size * 100;
          self.print();
          // console.log(row.data[0])
          console.log(count);tcount=0;
        }
        count++;tcount++;
        
        self.parseCSV(row.data[0],function(obj){
	      outstream.write(obj);
	      });
	    },
	    error:function(e){console.log("error",e);self.meta.time.readping=process.hrtime(hrstart)[0];self.meta.action=null;callback(true,e);},
      complete: function() {console.log("done");self.meta.action=null;self.meta.time.readping=process.hrtime(hrstart)[0];self.meta.action=null;callback(false);}
    });
  },
  parseCSV:function(obj,callback){
    this.irow++;
    const ships = this.SHIP.ships;
    for(var engine in ENGINES){
      const ping = {};
      let allzeros = true;
      for(let i=0,n=EMISSIONS.length;i<n;i++){
        const emission = EMISSIONS[i];
        const prop = engine + "_" + emission;
        const pvalue = parseFloat(obj[prop]);
        const value = pvalue ? pvalue : 0;
        if(value>0){allzeros=false;}
        ping[emission]=value;
      }
      if(!(allzeros)){
        const ship_id = obj.ship_id;
        // const ip      = parseFloat(obj.ip);
        const point_id= obj.grid_index;
        const mode    = obj.activity_type;
        const datetime= Date.parse(obj.date_time);
        
        if(!(ships[ship_id]))this.errorlog.push("Cannot find ship_id : " + ship_id);
        
        if(!(this.points[point_id])){
          const lng = parseFloat(obj.long) || 0;
          const lat = parseFloat(obj.lat)  || 0;
          let meit = parseInt(obj.region);
          meit = (meit >= 0 && meit <= 22)? meit:0;
          
          const mapmeit = this.MEITREGION.getIndex(lng,lat);
          const hex_16  = this.hex[16].getHexIndex(lng,lat);
          const hex_4   = this.hex[4].getHexIndex(lng,lat);
          // const hex_1   = this.hex[1].getHexIndex(lng,lat);
          
          this.points[point_id]    = this.ipoint;
          this.lng[this.ipoint]    = lng;
          this.lat[this.ipoint]    = lat;
          this.meit[this.ipoint]   = meit;
          this.mapmeit[this.ipoint]= mapmeit;
          this.hex_16[this.ipoint] = hex_16;
          this.hex_4[this.ipoint]  = hex_4;
          // this.hex_1[this.ipoint]  = hex_1;
          
          this.ipoint++;
        }
        
        ping.ship_id = ships[ship_id].id;
        ping.class   = ships[ship_id].Class;
        ping.type    = ships[ship_id].type;
        // ping.ip      = ip;
        ping.point_id= point_id;
        // ping.mode    = MODES[mode];
        ping.mode    = mode;
        ping.engine  = ENGINES[engine];
        ping.datetime= datetime/1E3;
        ping.lng     = this.lng[this.points[point_id]];
        ping.lat     = this.lat[this.points[point_id]];
        ping.meit    = this.meit[this.points[point_id]];
        ping.mapmeit = this.mapmeit[this.points[point_id]];
        ping.hex_16  = this.hex_16[this.points[point_id]];
        ping.hex_4   = this.hex_4[this.points[point_id]];
        // ping.hex_1   = this.hex_1[this.points[point_id]];

        const data=FIELDS.map(f=>ping[f]);
        this.iping++;
        callback(data.join(",") + "\n");
      }
    }
  },
};


module.exports = Convert;