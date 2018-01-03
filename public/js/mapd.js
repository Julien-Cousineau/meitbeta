

function MapD(parent){
  this._parent = parent;
  const self = this;
  this.pointer = function(){return self;};

  this.bounds=[-100,50,-40,60];
  this.first = true;
  this.tablename = 'table1'
  this.createCrossFilter(this.tablename);
}
MapD.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get emission(){return this.parent.emission;},
  get divider(){return this.parent.divider;},
  get reduceFunc(){return this.reduceFunction();},
  get mapLayer(){return this.parent.mapLayer;},
  get geoMapLayer(){return this.parent.geomaps[this.mapLayer].dc;},
  // construct:function(){
  //   const self=this;
  //   this.con=new MapdCon()
  //   .protocol("http")
  //   .host("52.242.33.125")
  //   .port("9092")
  //   .dbName("mapd")
  //   .user("mapd")
  //   .password("HyperInteractive")
  //   .connect(function(error, con) {
  //     crossfilter.crossfilter(con, "table5").then(function(crossFilter){return self.createCharts(crossFilter);})
  //   });
  // },
  createCrossFilter:function(name){
    const self=this;
    new MapdCon()
    .protocol("http")
    .host("52.242.33.125")
    .port("9092")
    .dbName("mapd")
    .user("mapd")
    .password("HyperInteractive")
    .connect(function(error, con) {
       self.con=con;
       crossfilter.crossfilter(con, name).then(function(crossFilter){return self.crossFilterSetup(crossFilter);})
    });
  },
  crossFilterSetup:function(crossFilter){
    // console.log(crossFilter)
    this.crossFilter = crossFilter;
    if(this.first)this.createCharts();
  },
  reduceFunctionOld:function(){
     return[
        {expression: "nox",agg_mode:"sum",name: "nox"},
        // {expression: "co",agg_mode:"sum",name: "co"},
        // {expression: "hc",agg_mode:"sum",name: "hc"},
        // {expression: "nh3",agg_mode:"sum",name: "nh3"},
        // {expression: "co2",agg_mode:"sum",name: "co2"},
        // {expression: "ch4",agg_mode:"sum",name: "ch4"},
        // {expression: "n2o",agg_mode:"sum",name: "n2o"},
        // {expression: "sox",agg_mode:"sum",name: "sox"},
        // {expression: "pm25",agg_mode:"sum",name: "pm25"},
        // {expression: "pm10",agg_mode:"sum",name: "pm10"},
        // {expression: "pm",agg_mode:"sum",name: "pm"},
        // {expression: "bc",agg_mode:"sum",name: "bc"},
      ];
  },
  reduceFunction:function(){
     return [{expression: this.emission,agg_mode:"sum",name: this.emission}]
  },
  createClassChart:function(){
  },
  colorScheme:["#22A7F0", "#3ad6cd", "#d4e666"],
  createCharts:function(){
    const self=this;
    const crossFilter = this.crossFilter;
    // console.log(crossFilter)
    let allColumns = crossFilter.getColumns();
    const charts=this.parent.charts;
    
    let array=[];
    for(let i in charts){
      array.push(i);
    }
    
    const createChartFunc = function(i,callback){
      let chart=charts[i];
      chart.dc = new Chart(self.pointer,chart,function(){
        // console.log("done chart")
        callback();
      });
    }
    async.each(array, createChartFunc,function(err){
      if( err ) {console.log('A file failed to process');}
      self.createMapDim();
      self.createNumberDisplay();
      self.render();
      self.resizeFunc();
      self.first = false;
    });

  },
  createMapDim:function(){
    const geomaps=this.parent.geomaps;
    for(let key in geomaps){
      const geomap = geomaps[key];
      geomap.dc=new GeoMap(this.pointer,geomap)
    };
  },
  createNumberDisplay:function(){
    this.total = this.crossFilter.groupAll().reduceMulti(this.reduceFunc);
  },
  changeGroup:function(){
    const charts=this.parent.charts;
    const geomaps=this.parent.geomaps;
    for(let key in charts){
      let chart=charts[key];
      chart.dc.changeGroup();
    }
    for(let key in geomaps){
      const geomap = geomaps[key];
      geomap.dc.changeGroup();
    };
    this.total.reduceMulti(this.reduceFunc);
  },
  filterMap:function(bounds){
    // const bounds = this.parent.mapContainer.bounds;
    const minx=bounds[0],miny=bounds[1],maxx=bounds[2],maxy=bounds[3];
    
    (minx===maxx) ? 
      this.parent.geomaps['lng'].dc.dimension.filterAll():
      this.parent.geomaps['lng'].dc.dimension.filter(dc.filters.RangedFilter(minx,maxx));;
    
    (miny===maxy) ?
      this.parent.geomaps['lat'].dc.dimension.filterAll():
      this.parent.geomaps['lat'].dc.dimension.filter(dc.filters.RangedFilter(miny,maxy));

    // const maplayer=this.mapLayer,emission=this.emission,table=this.tablename;
    // const query =`SELECT {0},sum({1}) AS {1} FROM table5 WHERE lng>={2} AND lng<={3} AND lat>={4} AND lat<={5}  GROUP BY {0};`.format(maplayer,emission,table,minx,maxx,miny,maxy);
    const self=this;
    // this.parent.geomaps[this.mapLayer].dc.group.all(function(err,data){self.parent.mapContainer.updateHexPaint(data)});
    // self.parent.mapContainer.updateHexPaint(data)
    // const self = this;
    // this.con.query(query, {}, function(err, data) {
    //   self.parent.mapContainer.updateHexPaint(data)
    // });
    // this.draw();
  },

  
  resizeFunc:function(){
    const self=this;
    window.addEventListener("resize", debounce(function(){self.reSizeAll()}, 100));
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
    this.draw();
  },
  draw:function(){
    const self=this;
    dc.redrawAllAsync();
    self.getTotalMap();
  },
  render:function(){
    dc.renderAllAsync()
    this.getTotalMap();
  },
  getTotalMap:function(){
    const self=this;
    this.total.valuesAsync().then(data=>$('#totalnumber').text(self.formatTotal(data[self.emission]/self.divider)));
    // console.log(this.mapLayer)
    // console.log(this.parent.geomaps)
    // console.log(this.parent.geomaps[this.mapLayer])
    console.log(this.parent.geomaps[this.mapLayer].dc.group)
    this.parent.geomaps[this.mapLayer].dc.group.sizeAsync().then(function(size){
      const steps=Math.ceil(size / 10000.0);
      const array=range(steps)
      // console.log(size,steps)
      self.parent.mapContainer.resetStops();
      // self.filterMap(self.parent.mapContainer.bounds);
      console.time("download")
      self.parent.geomaps[self.mapLayer].dc.group.all(function(err,data){console.timeEnd("download");self.parent.mapContainer.updateHexPaint(data)});
      
      // self.filterMap([0,0,0,0]);
      // var q = async.queue(function(i, callback) {
      //     // console.log(i)
      //     self.parent.geomaps[self.mapLayer].dc.group.topAsync(10000,10000*i).then(function(data){
      //     // console.log(data[0])
      //     self.parent.mapContainer.updateHexPaint(data)
      //     callback();
      //   })
      //   // console.log("In here")
      //   // callback();
      // }, 2);
      
      
      // q.drain = function() {
      //   console.log('all items have been processed');
      // };
      // array.forEach(item=>{
      //   q.push(item,function(err){});
      // })
      
      // // const func = function(i,_callback){
      // //   q.push(i,function(){_callback});
      // // }
      // // async.each(array,func,function(err,result){
      // //   console.log("done")
      // //   q.drain = function() {
      // //   console.log('all items have been processed');
      // //     };
      // // });
    });
    // this.parent.geomaps[this.mapLayer].dc.group.all(function(err,data){self.parent.mapContainer.updateHexPaint(data)});
  
    
  },
  formatTotal:function(x){
    var formatSi = d3.format(".3s");
    var formate = d3.format(".1e");
    var formatf = d3.format(".2n");
    var s = formatSi(x);
    switch (s[s.length - 1]) {
        case "k": return s.slice(0, -1) + " thousand";
        case "M": return s.slice(0, -1) + " million";
        case "G": return s.slice(0, -1) + " billion";
        case "T": return s.slice(0, -1) + " trillion";
        case "m": return formatf(x);
     }
     if(x==0){return s;}
     if (x< 0.001){return formate(x);}
    
     return s;
  },
};
