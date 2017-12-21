
mapboxgl.accessToken='pk.eyJ1IjoianVsaWVuY291c2luZWF1IiwiYSI6ImNpc2h1OHN2bjAwNzMyeG1za3U0anczcTgifQ.KCp_hDxNidB1n29_yBPXdg'

function MapContainer(parent,options,callback){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
  this.callback=callback;
  this.construct();
}

MapContainer.prototype = {
  options:{
    zoom:3,
    paint:{
      hex:{"fill-outline-color": "rgba(0,0,0,0.0)","fill-color": "rgba(0,0,0,0.5)"},
      meit: {"fill-outline-color": "rgba(0,0,0,0.5)","fill-color": "rgba(0,0,0,0.1)"},
    },
  },
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get zoom(){return this.options.zoom;},
  set zoom(value){
    if(value !==this.options.zoom){
      this.options.zoom=value;
      for(let key in this.parent.geomaps){
        let layer = this.parent.geomaps[key];
        if(value >=layer.minimum && value<=layer.maximum)this.parent.mapLayer=key;
      }
    }
  },
  construct:function(){
      
    const map =this.map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/light-v9',
      center: [ -100.00, 60.0 ],
      zoom: this.zoom, 
    });
    const self=this;
    map.on("error",function(e){return self.error(e);});
    map.on("zoomend",debounce(function(){self.onMove()}, 1000));
    map.on("dragend",debounce(function(){self.onMove()}, 1000));
    map.on('load', function () {return self.loaded();});
    
  },
  loaded:function(){
    this.addSources();
    this.addLayers();
    this.callback();
  },
  error:function(e){
    if (e && e.error !== 'Error: Not Found')console.error(e);
  },
  addSources:function(){
    const IP = this.parent.options.IP;
    this.map.addSource('meit_S', {type: 'vector',tiles: [IP + "tiles/meit/{z}/{x}/{y}.pbf"]});
    this.map.addSource('hex', {type: 'vector',tiles: [IP + "tiles/hex/{z}/{x}/{y}.pbf"]});
    this.map.addSource('terminalS', {type: 'vector',tiles: [IP + "tiles/terminals/{z}/{x}/{y}.pbf"]});
  },
  addLayers:function(){
    this.map.addLayer({"id": "meit","type": "fill","source": 'meit_S',"source-layer": "meitregions","paint": this.options.paint.meit});
    this.map.addLayer({"id": "hexgrid","type": "fill","source": 'hex',"source-layer": "hex","paint": this.options.paint.hex});
  },
  updateHexPaint:function(data){
    const self=this;
    const emission = this.parent.emission;
    if(data && this.map.getLayer('hexgrid')){
      console.time("inside")
      
        // if(data.values===null)return;
        // let max = Math.max.apply(Math,data.map(function(row){return row[emission]}))
        // max=(max<1) ? 1:max;
        var x = d3.scale.log()
          .domain([1, 1000000])
          .range(['rgba(255, 255, 255, 0)', 'rgba(239, 59, 54, 0.7)']);
        var stops = data.map(function(row) {
           var color = x(row[emission]);
           return [row.key0, color];
        });
      if(this.zoom<4){
        self.map.setPaintProperty('meit', 'fill-color', {"property": "gid",default: "rgba(255,255,255,0.0)","type": "categorical","stops": stops});
      } else {
        self.map.setPaintProperty('hexgrid', 'fill-color', {"property": "gid",default: "rgba(255,255,255,0.0)","type": "categorical","stops": stops});
      }
      console.timeEnd("inside")
    }

  },
  onMove:function(){
    var lon1=this.map.getBounds()._sw.lng;
    var lat1=this.map.getBounds()._sw.lat;
    var lon2=this.map.getBounds()._ne.lng;
    var lat2=this.map.getBounds()._ne.lat;
    this.zoom=Math.floor(this.map.getZoom());
    this.bounds =[lon1,lat1,lon2,lat2];
    this.parent.mapd.filterMap();
    console.log("moving")
  },


};