const fs  = require('fs');
const Papa= require('papaparse');
const path = require('path');
const CONVERTFOLDER =  path.join(__dirname, '../data/convert');

// const file = path.resolve(CONVERTFOLDER,'arcticWIG_09212017.csv2')
const file = path.resolve(CONVERTFOLDER,'pacific_emissions_11162017.csv2')

function ReadCSV(input){
    this.readCSV(input,function(){})
}
ReadCSV.prototype = {
  readCSV:function(input,callback){
    const instream = fs.createReadStream(input);
    let tcount=0,count=0;

    Papa.parse(instream, {
      header: true,
	    step: function(row) {
        if(count<1000){
          console.log(row.data[0]);
          tcount=0;
        }
        count++;tcount++;
	    },
	    error:function(e){console.log("error",e);},
      complete: function() {console.log("done");}
    });
  },
}
new ReadCSV(file)