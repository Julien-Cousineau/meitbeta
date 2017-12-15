

function MapD(parent){
  this._parent = parent;
  const self = this;
  this.pointer = function(){return self;};
  this.construct()
  this.emissionType = 'nox';
  this.divider = 1000000;
  this.bounds=[-100,50,-40,60];
  this.mapLayer='hex16'
}
MapD.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get reduceFunc(){return this.reduceFunction();},
  get geoMapLayer(){return this.parent.geomaps[this.mapLayer].dc;},
  construct:function(){
    const self=this;
    this.con=new MapdCon()
    .protocol("http")
    .host("52.242.33.125")
    .port("9092")
    .dbName("mapd")
    .user("mapd")
    .password("HyperInteractive")
    .connect(function(error, con) {
       crossfilter.crossfilter(con, "table3").then(function(crossFilter){return self.createCharts(crossFilter);})
    });
  },
  
  reduceFunction:function(){
     return[
        {expression: "nox",agg_mode:"sum",name: "nox"},
        {expression: "co",agg_mode:"sum",name: "co"},
        {expression: "hc",agg_mode:"sum",name: "hc"},
        {expression: "nh3",agg_mode:"sum",name: "nh3"},
        {expression: "co2",agg_mode:"sum",name: "co2"},
        {expression: "ch4",agg_mode:"sum",name: "ch4"},
        {expression: "n2o",agg_mode:"sum",name: "n2o"},
        {expression: "sox",agg_mode:"sum",name: "sox"},
        {expression: "pm25",agg_mode:"sum",name: "pm25"},
        {expression: "pm10",agg_mode:"sum",name: "pm10"},
        {expression: "pm",agg_mode:"sum",name: "pm"},
        {expression: "bc",agg_mode:"sum",name: "bc"},
      ];
  },
  createClassChart:function(){
  },
  colorScheme:["#22A7F0", "#3ad6cd", "#d4e666"],
  createCharts:function(crossFilter){
    const self=this;
    this.crossFilter = crossFilter;
    let allColumns = crossFilter.getColumns();
    const charts=this.parent.charts;
    
    let array=[];
    for(let i in charts){
      array.push(i);
    }
    
    const createChartFunc = function(i,callback){
      let chart=charts[i];
      chart.dc = new Chart(self.pointer,chart,function(){
        console.log("done chart")
        callback();
      });
    }
    async.each(array, createChartFunc,function(err){
      if( err ) {console.log('A file failed to process');}
      console.log("done")
      self.createMapDim();
      dc.renderAllAsync()
      self.resizeFunc();
    });

  },
  createMapDim:function(){
    const self=this;
    const geomaps=this.parent.geomaps;
    for(let key in geomaps){
      const geomap = geomaps[key];
      geomap.dc=new GeoMap(self.pointer,geomap)
    };
  },
  filterMap:function(){
    const bounds = this.parent.mapContainer.bounds;
    this.parent.geomaps['lng'].dc.dimension.filter(dc.filters.RangedFilter(bounds[0],bounds[2]));
    this.parent.geomaps['lat'].dc.dimension.filter(dc.filters.RangedFilter(bounds[1],bounds[3]));
    dc.redrawAllAsync();
  },
  getMapValue:function(){
    console.log(this.mapLayer)
    console.log(this.parent.geomaps[this.mapLayer])
    console.log(this.parent.geomaps[this.mapLayer].dc.group.all());
  },
  
  resizeFunc:function(){
    const self=this;
    window.addEventListener("resize", this.debounce(function(){self.reSizeAll()}, 100));
  },
  reSizeAll:function(){
    const charts=this.parent.charts;
    for(let i in charts){
      let chart=charts[i];
      const width = $('div[panelid="{0}"] .x_content'.format(chart.id)).width();
      const height = $('div[panelid="{0}"] .x_content'.format(chart.id)).height();
      $('.forchart').css("width", width );
      $('.forchart').css("height", height );
      chart.dc.dc.height(height)
                 .width(width);
    }
    dc.redrawAllAsync();
  },
  debounce:function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },

};
