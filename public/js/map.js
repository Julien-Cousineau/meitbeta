
mapboxgl.accessToken='pk.eyJ1IjoianVsaWVuY291c2luZWF1IiwiYSI6ImNpc2h1OHN2bjAwNzMyeG1za3U0anczcTgifQ.KCp_hDxNidB1n29_yBPXdg'

function MapContainer(parent,options,callback){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
  const self   = this;
  this.pointer = function(){return self;};
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
    const self=this;
    this.readTerminals(function(){
      self.createMap();
    });
  },
  createMap:function(){    
    const map =this.map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/light-v9',
      center: [ -100.00, 60.0 ],
      zoom: this.zoom, 
    });
    const self=this;
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new MapboxGeocoder({accessToken: mapboxgl.accessToken,country:'CA',zoom:12,limit:10,terminals:this.terminals}),'top-left');
    map.on("error",function(e){return self.error(e);});
    map.on("zoomend",debounce(function(){self.onMove()}, 1000));
    map.on("dragend",debounce(function(){self.onMove()}, 1000));
    map.on('mousedown', debounce(function(e){self.mouseDown(e)}, 10));
    map.on('touchstart',debounce(function(e){self.mouseDown(e)}, 10));
    map.on('mouseup', debounce(function(e){self.mouseUp(e)}, 10));
    map.on('mouseout', debounce(function(e){self.mouseUp(e)}, 10));
    map.on('mouseleave', debounce(function(e){self.mouseUp(e)}, 10));
    map.on('touchend',debounce(function(e){self.mouseUp(e)}, 10));
    map.on('touchcancel',debounce(function(e){self.mouseUp(e)}, 10));
    map.on('mousemove',debounce(function(e){self.mouseMove(e)}, 10));
    map.on('touchmove',debounce(function(e){self.mouseMove(e)}, 10));
    map.on('load', function () {self.loaded();});
  },
  readTerminals: function(callback){
    const self=this;
    d3.json("/js/terminals.geojson", function(data) {
      self.terminals = data;
      callback();
    });
  },
  loaded:function(){
    this.addSources();
    this.addLayers();
    this.addSelectButton();
    this.selectBox = new SelectBox(this.pointer);
    
    this.callback();
  },
  addSelectButton:function(){
    const self=this;
    let html = `
    <div class="selectpanel">
      <div class="inside">
        <form>
          <div>
            <div><label for="point1" class="control-label">Point #1</label>
                <a class="clearpanel" style="float: right;">clear</a>
            </div>
            <div class="form-inline">
              <input type="number" step="0.01" placeholder="Latitude" class="form-control coord" id="lat1" group="box" name="point1">
              <input type="number" step="0.01" placeholder="Longitude" class="form-control coord" id="lon1" group="box" name="point1">
            </div>
          </div>
          <div>
            <label for="point2" class="control-label">Point #2</label>
            <div class="form-inline">
              <input type="number" step="0.01" placeholder="Latitude" class="form-control coord" id="lat2" group="box" name="point2">
              <input type="number" step="0.01" placeholder="Longitude" class="form-control coord" id="lon2" group="box" name="point2">
            </div>
          </div>
        </form> 
      </div>
      
    </div>
    <div class="selectbtn">
                  <button class="btn btn-light"><i class="fa fa-square-o fa-2x" aria-hidden="true"></i><i class="fa fa-mouse-pointer mpicon"></i></button>
                </div>`
    $(".mapboxgl-ctrl-top-left").append(html);
    $('.selectbtn button').on("click",function(){self.selectBox.activate();})
    
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
      //   var x = d3.scale.log()
      //     .domain([1, 1000000])
      //     .range(['rgba(255, 255, 255, 0)', 'rgba(239, 59, 54, 0.7)']);
      //   var stops = data.map(function(row) {
      //     var color = x(row[emission]);
      //     return [row.key0, color];
      //   });
      // if(this.zoom<4){
      //   self.map.setPaintProperty('meit', 'fill-color', {"property": "gid",default: "rgba(255,255,255,0.0)","type": "categorical","stops": stops});
      // } else {
      //   self.map.setPaintProperty('hexgrid', 'fill-color', {"property": "gid",default: "rgba(255,255,255,0.0)","type": "categorical","stops": stops});
      // }
      console.timeEnd("inside")
    }

  },

  mouseDown:function(e){
    // e.originalEvent.preventDefault();
    
    if(this.selectBox && this.selectBox.active)this.selectBox.down(e);
  },
  mouseMove:function(e){
    // e.originalEvent.preventDefault();
    if(this.selectBox && this.selectBox.active && this.selectBox.dragging)this.selectBox.move(e);
  },
  mouseUp:function(e){
    // e.originalEvent.preventDefault();
    if(this.selectBox && this.selectBox.active && this.selectBox.dragging)this.selectBox.up(e);
  },
  onMove:function(){
    var lon1=this.map.getBounds()._sw.lng;
    var lat1=this.map.getBounds()._sw.lat;
    var lon2=this.map.getBounds()._ne.lng;
    var lat2=this.map.getBounds()._ne.lat;
    this.zoom=Math.floor(this.map.getZoom());
    this.bounds =[lon1,lat1,lon2,lat2];
    // this.parent.mapd.filterMap();
    console.log("moving")
  },
  get bounds(){
    var lon1=this.map.getBounds()._sw.lng;
    var lat1=this.map.getBounds()._sw.lat;
    var lon2=this.map.getBounds()._ne.lng;
    var lat2=this.map.getBounds()._ne.lat;
    return [lon1,lat1,lon2,lat2];
  },


};

function SelectBox(parent){
  this._parent = parent;
  const self   = this;
  this.pointer = function(){return self;};
  this.id='boxactive';
  this.source='boxactive';
  this.active = false;
  this.dragging = false;
  this.hiding = true;
  this.paint = {"fill-outline-color": "rgba(0,0,0,0.0)","fill-color": "rgba(0,0,0,0.2)"};
  this.layout = {'visibility': 'none'};
  this.construct();
}
SelectBox.prototype = {
  get divbutton(){return $('.selectbtn button')},
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  construct:function(){
    this.reset();
    this.map.addSource(this.source, {type: "geojson",data: this.bbox});
    this.map.addLayer({"id": this.id,"type": "fill","source": this.source,'layout': this.layout,"paint": this.paint});
    this.outlineBox = new OutlineBox(this.pointer);
    this.inputFunc();
  },
  // setPaint:function(paint){
  //   Object.keys(paint).forEach(prop=>this.map.setPaintProperty(this.id,prop,paint[prop]),this)
  // },
  inputFunc:function(){
    const self=this;
    console.log("HERHERHEH")
    $("#lat1").change(function(e){console.log('HEHEHE');self.updateBBox();});
    $("#lon1").change(function(e){self.updateBBox();});
    $("#lat2").change(function(e){self.updateBBox();});
    $("#lon2").change(function(e){self.updateBBox();});  
    $('.clearpanel').on("click",function(){self.clear();})
  },
  updateBBox:function(){
    console.log("updateBBox")
    this.start={lng:$("#lon1").val(),lat:$("#lat1").val()};
    this.end={lng:$("#lon2").val(),lat:$("#lat2").val()};
    this.update();
    this.outlineBox.bounds=this.bounds;
    this.outlineBox.show();
    this.updateMap();
  },
  reset:function(){
    this.start={lng:0,lat:0};
    this.end={lng:0,lat:0};
  },
  down:function(e){
    this.dragging = true;
    this.start = e.lngLat;
    this.end = e.lngLat;
    this.update();
  },
  move:function(e,callback){
    this.end = e.lngLat;
    this.update();
  },
  up:function(e){
    this.dragging = false;
    this.end = e.lngLat;
    this.update();
    this.deActivate();
    this.outlineBox.bounds=this.bounds;
    this.outlineBox.show();
    this.updateMap();
  },
  get bounds(){
    var minx=Math.min(this.start.lng,this.end.lng);
    var miny=Math.min(this.start.lat,this.end.lat);
    var maxx=Math.max(this.start.lng,this.end.lng);
    var maxy=Math.max(this.start.lat,this.end.lat);
    return [minx,miny,maxx,maxy];
  },
  get map(){return this.parent.map;},
  get bbox(){return turf.bboxPolygon(this.bounds);},
  get view(){return turf.difference(this.mapbbox,this.bbox);},
  update:function(){
    this.map.getSource(this.source)
                   .setData(this.view);
  },
  updateMap:function(){
    
    
    // this.parent.parent.mapd.filterMap(this.bounds);
  },
  show:function(){
    this.map.setLayoutProperty(this.id, 'visibility', 'visible');
    this.hiding=false;
  },
  hide:function(){
    this.map.setLayoutProperty(this.id, 'visibility', 'none');
    this.hiding=true;
  },
  clear:function(){
    this.hide();
    this.outlineBox.hide();
    this.reset();
    this.updateMap();
  },
  activate:function(){
    this.active = true;
    this.divbutton.addClass("active")
    this.map.getCanvas().style.cursor = 'crosshair';
    this.map.dragPan.disable();
    // this.setPaint(this.activepaint);
    this.mapbbox = turf.bboxPolygon(this.parent.bounds);
    this.update();
    this.outlineBox.hide();
    if(this.hiding)this.show();
  },
  deActivate:function(){
    this.active = false;
    this.divbutton.removeClass("active")
    this.map.getCanvas().style.cursor = '';
    this.map.dragPan.enable();
    this.hide();
    // this.setPaint(this.paint);
  },
  
}

function OutlineBox(parent){
  this._parent = parent;
  this.id = 'boxselect';
  this.source = 'boxselect';
  this.layout = {'visibility': 'none'};
  this.paint = {"line-color": "rgba(255,0,0,1.0)"};
  this.construct();
  
}
OutlineBox.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get map(){return this.parent.parent.map;},
  get bounds(){if(!(this._bounds)){this._bounds = [0,0,0,0];}return this._bounds;},
  get bbox(){return turf.bboxPolygon(this.bounds);},

  set bounds(value){this._bounds=value;
    this.map.getSource(this.source)
            .setData(this.bbox);
    this.updatePanel();
  },
  construct:function(){
    this.map.addSource(this.source, {type: "geojson",data: this.bbox});
    this.map.addLayer({"id": this.id,"type": "line","source": this.source,'layout': this.layout,"paint": this.paint});
    
  },
  hide:function(){
    this.map.setLayoutProperty(this.id, 'visibility', 'none');
    this.hidePanel()
  },
  show:function(){
    this.map.setLayoutProperty(this.id, 'visibility', 'visible');
    this.showPanel()
  },
  showPanel:function(){
    $('.selectpanel .inside').css('margin-top',0);
  },
  hidePanel:function(){
    $('.selectpanel .inside').css('margin-top','-140px');
  },
  updatePanel:function(){
    $("#lat1").val(this.bounds[1].toFixed(2));
    $("#lon1").val(this.bounds[0].toFixed(2));
    $("#lat2").val(this.bounds[3].toFixed(2));
    $("#lon2").val(this.bounds[2].toFixed(2));  
  },
  
}