const fs  = require('fs');
const Papa= require('papaparse');
const path = require('path');

const CONSTANTS= require('./constants');
const YEARS    = CONSTANTS.YEARS;
const ENGINES  = CONSTANTS.ENGINES;
const EMISSIONS= CONSTANTS.EMISSIONS;
const REGIONS  = CONSTANTS.REGIONS;

const blank = {};
for(let iyear=0,nyears=YEARS.length;iyear<nyears;iyear++){
  const year = YEARS[iyear];
  blank[year]={};
  for(var engine in ENGINES){
     const code = ENGINES[engine];
     if(!(blank[year][code]))blank[year][code]={};
     for(let iregion=0,nregions=REGIONS.length;iregion<nregions;iregion++){
       const region = REGIONS[iregion];
       if(!(blank[year][code][region]))blank[year][code][region]={};
       EMISSIONS.forEach(emission=>blank[year][code][region][emission] =1.0);
     }
  }
}

function Ship(parent,id){
  
  if(typeof id!=="undefined"){
    this.id = id;
    this.forecast = blank;

  } else {
    this._parent = parent;
    this.iship= 0;
    this.iclass= 0;
    this.itype= 0;
    this.ships= {};
    // this.rships ={};
    this.classes = {};
    this.types ={};
  }
}
Ship.prototype={
    get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
    parseCSV:function(obj){
    
    const ship_id = obj.ship_id;
    const year    = obj.forecast_year;
    const region  = obj.meit_region;
    const _class  = obj.ship_class;
    const type    = obj.ship_type;
    
    if(!(this.ships[ship_id])){this.ships[ship_id]=new Ship(null,this.iship++)}
    if(!(this.classes[_class])){this.classes[_class]=this.iclass++;}
    if(!(this.types[type])){this.types[type]=this.itype++;}
    const id = this.ships[ship_id].id;
    
    
    // if(!(this.rships[id])){this.rships[id]=new Ship(id);}
    // if(this.iship===1){console.log(this.ships[ship_id]);}
    
    if(REGIONS.includes(parseFloat(region))){
      
      this.ships[ship_id].type  = type;   
      this.ships[ship_id].Class= _class;
      // this.ships[ship_id].Class = _class;
      // this.ships[ship_id].type  = type  ; 
      
      for(var propertyName in obj) {      
        let [engine,emission] = propertyName.split("_");
        
        if(ENGINES[engine]){
          const code = ENGINES[engine];
          // this.ships[ship_id].forecast[year][code][region][emission]=parseFloat(obj[propertyName]);
          this.ships[ship_id].forecast[year][code][region][emission]=parseFloat(obj[propertyName]);
          
        }      
      }
    }
  },
  readCSV:function(filename,callback){
    const self=this;
    console.log(filename)
    const instream = fs.createReadStream(filename);
    self.parent.meta.action='Reading ' + path.basename(filename);
    let hrstart = process.hrtime();
    let tcount=0,count=0;
    Papa.parse(instream, {
      header: true,
    	step: function(row) {
    	  if(tcount>=100){
          self.parent.meta.progress=row.meta.cursor / instream.size * 100;
          self.parent.print();
          console.log(count);tcount=0;
        }
  	    self.parseCSV(row.data[0]);
    	},    	
    	error:function(e){self.parent.meta.time.readship=process.hrtime(hrstart)[0];self.parent.meta.action=null;callback(true,e);},
    	complete: function(){self.parent.meta.time.readship=process.hrtime(hrstart)[0];self.parent.meta.action=null;;callback(false);}
    }); 
  },

};

module.exports = Ship;