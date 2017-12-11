var JSONStream = require('JSONStream');

const fs  = require('fs');
const Prop = require('./prop');
const kdbush = require('./kdbush/kdbush');
const geokdbush = require('./geokdbush');
const path = require('path');

function Hex(parent){
  this._parent = parent;
  this.hexes = {};
  this.ihex=0;
  this.minmax={};
}
Hex.prototype={
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get Props(){
    if(!(this._Props)){
      const Props = new Prop();
      Props.newProp('id','int32',4);
      Props.newProp("lng",'float',4);
      Props.newProp("lat",'float',4);
      this._Props = Props;
    }
    return this._Props;
  },
  readJSON:function(item,callback){
    const self = this;
    const hex = item.hex;
    if(fs.existsSync(hex) && !(item.overwrite)){
      callback(false);return;
    }
    
    self.readJSONPart1(item,function(e,icount){
      if(e)throw Error("Error in readJSONPart1");
      self.readJSONPart2(icount,item,function(e){
        if(e)throw Error("Error in readJSONPart2");
        callback(false);
      });
    });
  },
  readJSONPart2:function(icount,item,callback){
    const hex = item.hex;
    const hext = item.hex + "t";
    console.time("Writing " + hex);
  	const instream  = fs.createReadStream(hext);
  	const outstream = fs.createWriteStream(hex);
  	const buffer = new Buffer(4);buffer.writeUInt32BE(icount);
    outstream.write(buffer);
  	instream.on('data',function(data) {outstream.write(data);});
    instream.on('close', function() {
      outstream.close();
      console.timeEnd("Writing " + hex);
      callback(false);
    });
  },  
  readJSONPart1:function(item,callback){
    const self=this;
    const geojson = item.geojson;
    const hext = item.hex + "t";
    console.time("Writing " + hext);
    const instream = fs.createReadStream(geojson);
    const outstream = fs.createWriteStream(hext);
    let count =0,tcount =0;
    let transformStream = JSONStream.parse( "features.*" );
    let icount = 0;
    instream.pipe( transformStream )
      .on("data", function ( data ) {
        if(tcount>=10000){console.log(count);tcount=0;}
        count++;tcount++;
        const row ={};
        row.id =data.properties.gid;
        const coords = data.geometry.coordinates[0];
        let lat =0;
        let lng =0;
        for(let i=0,n=coords.length-1;i<n;i++){
            lng += data.geometry.coordinates[0][i][0];
            lat += data.geometry.coordinates[0][i][1];
        }
        lng /=(coords.length-1);
        lat /=(coords.length-1);
        row['lng'] = lng;
        row['lat'] = lat;
        // for(let i=0,n=coords.length;i<n;i++){
        //     row['lng_'+i] = data.geometry.coordina,,tes[0][i][0];
        //     row['lat_'+i] = data.geometry.coordinates[0][i][1];
        // }
        const newbuffer =self.Props.newBuffer();
        for(let i=0,n=self.Props.props.length;i<n;i++){
          const prop = self.Props.props[i];
          prop.write(newbuffer,row[prop.name]);
        }
        outstream.write(newbuffer);
        icount++;
        })
      .on("end",function () {console.timeEnd("Writing " + hext);callback(false,icount)});

  },

  initializeArrays:function(length){
    const props = this.Props.props;
     for(let i=0,n=props.length;i<n;i++){
       const prop = props[i];
       this.hexes[prop.name] = prop.newArray(length); 
     }
  },
  readHex:function(id,filename,callback){
    const self=this;
    const instream = fs.createReadStream(filename);
    self.parent.meta.action='Reading ' + path.basename(filename);
    let hrstart = process.hrtime();
    
  	
  	let count =0,tcount =0;
  	let chunksize=this.Props.alloc();
  	let header=true;
  	let nhex;
  	instream.on("readable", function() {
      let chunk;
      if(header){
        const buffer=instream.read(4);
        nhex=buffer.readInt32BE();
        self.initializeArrays(nhex);
        header=false;
      }
      while ((chunk = instream.read(chunksize)) ) {
        if(tcount>=100000){
          self.parent.meta.progress=parseFloat(count) / parseFloat(nhex) * 100;
          self.parent.print();
          console.log(count + " of " + nhex);
          tcount=0
        }
        count++;tcount++;
        self.parseHex(chunk);
      }
    })
    .on("end",function() {self.parent.meta.time.readhex=process.hrtime(hrstart)[0];self.parent.meta.action=null;self.createIndex();callback(false);});
  },
  createIndex:function(){
    this.index = kdbush(this.hexes.lng,this.hexes.lat,64);
  },
  parseHex:function(buffer){
    const ihex = this.ihex;
    const props = this.Props.props;
    
    for(let i=0,n=props.length;i<n;i++){
      const prop = props[i];
      this.hexes[prop.name][ihex] = prop.new(buffer);
    }
    this.ihex++;
  },
  getHexIndex:function(lng,lat){
    const closestpoint = geokdbush.around(this.index, lng, lat, 1)[0];
    return closestpoint;
  },
  
};

module.exports = Hex;