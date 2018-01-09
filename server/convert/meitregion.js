const fs  = require('fs');
const rbush = require('rbush');
const turfextent = require('turf-extent');
const inside = require('turf-inside');
const turfpoint = require('turf-point');
const path = require('path');
const util     = require('../util');

function MeitRegion(parent,options){
  this._parent = parent;
  this.options = util.extend(Object.create(this.options), options);
  
}
MeitRegion.prototype={
  options:{
    web:true,
  },  
  get web(){return this.options.web;},
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  read:function(file,callback){
    const self = this;
    const geojson = fs.readFileSync(file, 'utf8')
    const data = JSON.parse(geojson);
    const tree = this.tree = rbush();
    if(self.web)self.parent.meta.action='Reading ' + path.basename(file);

    const features = data.features;

    for (var i=0,n=features.length;i<n; i++){
      const feature = features[i]
      const bbox = turfextent(feature);
      const newid = feature.properties.gid;
      const item = {
            minX: bbox[0],
            minY: bbox[1],
            maxX: bbox[2],
            maxY: bbox[3],
            gid: newid,
            geom:feature
            };
        tree.insert(item);
      if(self.web)self.parent.meta.progress=parseFloat(i)/parseFloat(n-1) *100;
      if(self.web)self.parent.print();
    }
    this.getIndex();
    callback();
  },
  getID:function(lng,lat){
    const point1 = turfpoint([lng,lat], { });
    // let tempp = turfextent(userfeature)
    const results = this.tree.search({
          minX: lng,
          minY: lat,
          maxX: lng,
          maxY:lat
      });
    for(let i=0;i<results.length;i++){
       if(inside(point1,results[i].geom)){return results[i].gid;}
    }
    return (results.length>0) ? results[0].gid:0;
  },
  getIndex:function(lng,lat){
      return this.getID(lng,lat);
  }
    
};

module.exports = MeitRegion;