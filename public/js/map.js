
mapboxgl.accessToken='pk.eyJ1IjoianVsaWVuY291c2luZWF1IiwiYSI6ImNpc2h1OHN2bjAwNzMyeG1za3U0anczcTgifQ.KCp_hDxNidB1n29_yBPXdg'

function MapContainer(parent,options,callback){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
  this.callback=callback;
  this.construct();
}

MapContainer.prototype = {
  options:{
  },
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  construct:function(){
      
    const map =this.map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/light-v9',
      center: [ -100.00, 60.0 ],
      zoom: 3 
    });
    const self=this;
    map.on("zoomend",function(){return self.onMove();});
    map.on("dragend",function(){return self.onMove();});
    map.on('load', function () {return self.loaded();});
    
  },
  loaded:function(){
    this.callback();
  },
  onMove:function(){
    var lon1=this.map.getBounds()._sw.lng;
    var lat1=this.map.getBounds()._sw.lat;
    var lon2=this.map.getBounds()._ne.lng;
    var lat2=this.map.getBounds()._ne.lat;
    this.zoom=parseInt(this.map.getZoom());
    this.bounds =[lon1,lat1,lon2,lat2];
    this.parent.mapd.filterMap();
    console.log("moving")
  },


};