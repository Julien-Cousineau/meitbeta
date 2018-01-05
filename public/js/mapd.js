

function MapD(parent){
  this._parent = parent;
  const self = this;
  this.pointer = function(){return self;};
  this.cache={mapmeit:{},'hex16':{},'hex4':{},'hex1':{}},
  this.bounds=[-100,50,-40,60];
  this.first = true;
  this.tablename = 'table1'
  this.createCrossFilter(this.tablename);
  this.workerSetup();
  // this.queueSetup();
  
  // this.getMapSetup();
}
MapD.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get emission(){return this.parent.emission;},
  get divider(){return this.parent.divider;},
  get reduceFunc(){return this.reduceFunction();},
  get mapLayer(){return this.parent.mapLayer;},
  get geoMapLayer(){return this.parent.geomaps[this.mapLayer].dc;},
  get geomaps(){return this.parent.geomaps},
  get mapContainer(){return this.parent.mapContainer},
  get filters(){return this.crossFilter.getFilter()},
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
    const geomaps=this.geomaps;
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
    const geomaps=this.geomaps;
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
    // const bounds = this.mapContainer.bounds;
    const minx=bounds[0],miny=bounds[1],maxx=bounds[2],maxy=bounds[3];
    
    (minx===maxx) ? 
      this.geomaps['lng'].dc.dimension.filterAll():
      this.geomaps['lng'].dc.dimension.filter(dc.filters.RangedFilter(minx,maxx));;
    
    (miny===maxy) ?
      this.geomaps['lat'].dc.dimension.filterAll():
      this.geomaps['lat'].dc.dimension.filter(dc.filters.RangedFilter(miny,maxy));


    this.draw();
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
    dc.redrawAllAsync();
    this.getTotalMap();
  },
  render:function(){
    dc.renderAllAsync()
    this.getTotalMap();
  },
  workerSetup:function(){
    const self=this;
    const worker = this.worker = new Worker("js/myworker.js");

    worker.onmessage = function(event) {
      switch (event.data.type) {case "end": return self.postupdateData(event.data.data);}
    };
  },
  updateData:function(data){
    this.worker.postMessage({
      data: data,
      cache: this.cache[this.mapLayer],
      emission: this.emission
    });
  },
  postupdateData:function(cache){
    this.cache[this.mapLayer] = cache;
    this.mapContainer.updateHexPaint(cache);
  },
  queueFunc:function(obj,callback){
    const self=this;
    let querystring = self.geomaps[self.mapLayer].dc.group.writeTopQuery(50);
    
    console.log();
   
   
    if(obj){
      const dim = this.geomaps[self.mapLayer].dim;
      const table = this.parent.table;
      const limit = 1000000;
      
      const filters = this.crossFilter.getFilterString();
      const filtersstr = (filters)?"{0} AND ".format(filters):"";
      const con = "(lng>{0} AND lat>{1} AND lng<{2} AND lat<{3}) AND ".format(obj[0],obj[1],obj[2],obj[3]);
      querystring = "SELECT {0} as key0,SUM({1}) AS {1} FROM {2} WHERE {4}{5}{1} IS NOT NULL GROUP BY key0 ORDER BY {1} DESC LIMIT {3}"
                            .format(dim,this.emission,table,limit,con,filtersstr);
      // console.log(querystring)
    }
    this.con.query(querystring, {}, function(err, data) {
      if(err)console.log(err);
      callback(data);
    });
    
  },


  getMap:function(){
    const self=this;
    let bounds=null;
    if(self.mapLayer==='hex16' || self.mapLayer==='hex4' || self.mapLayer==='hex1'){bounds=self.mapContainer.bounds;} 
    self.queueFunc(bounds,function(data){self.updateData(data);});
  },

  getTotalMap:function(){
    const self=this;
    this.total.valuesAsync().then(data=>$('#totalnumber').text(self.formatTotal(data[self.emission]/self.divider)));
    this.getMap();
  },
  export:function(maincallback){
    const self=this;
    const filters = this.crossFilter.getFilterString();
    
    // const filtersstr = (filters)?"{0} AND ".format(filters):"";
    const charts = this.parent.charts;
    // const table = this.parent.table;
    const emissions = this.parent.emissions;
    const emissionOri = JSON.parse(JSON.stringify(this.parent.emission));
    // charts.map(chart=>{
    //   self.parent.emission=
    //   chart.dc.changeGroup()
    //   console.log(chart.dc.group)
      
    //   console.log(chart.dc.group.writeTopQuery())
    // });
      // emissions.map(emission=>{
      // const querystring = "SELECT {0} as key0,SUM({1}) AS {1} FROM {2} WHERE {3}{1} IS NOT NULL GROUP BY key0 ORDER BY {1} DESC"
      //                       .format(dim,emission,table,filtersstr);        
      //   self.con.query(querystring, {}, function(err, data) {
      //     if(err)console.log(err);
      //     callback(data);
      //   });
      // })

       
    // })
    // let results=[];
    // charts.forEach(chart=>{
    //   console.log(chart)
    //   const emissionFunc=function(emission,_callback){
    //     self.parent.emission = emission.name;
    //     chart.dc.group.topAsync(100).then(function(data){
    //       _callback(data);
    //     });
    //   };
    //   async.map(emissions,emissionFunc,function(data){
    //     results.push(data)
    //   });
      
    // });
    // async.series({
    //   one: function(parallelCb) {
    //       request('http://www.example1.com', function (err, res, body) {
    //           parallelCb(null, {err: err, res: res, body: body});
    //       });
    //   },
    //   two: function(parallelCb) {
    //       request('http://www.example2.com', function (err, res, body) {
    //           parallelCb(null, {err: err, res: res, body: body});
    //       });
    //   },
    //   three: function(parallelCb) {
    //       request('http://www.example3.com', function (err, res, body) {
    //           parallelCb(null, {err: err, res: res, body: body});
    //       });
    //   }
    // }, function(err, results) {
    //     // results will have the results of all 3
    //     console.log(results.one);
    //     console.log(results.two);
    //     console.log(results.three);
    // });



    const dimFunc = function(chart,callback){
      
      
      // console.log(chart.dc.group)
      const emissionFunc=function(emission,_callback){
        self.parent.emission = emission.name;
        let strquery = chart.dc.group.writeTopQuery(100);
        // console.log(filters);
        if(filters)strquery=strquery.split('WHERE')[0]+"WHERE " + filters + "GROUP BY" +strquery.split('GROUP BY')[1]
        // console.log(strquery);
        self.con.query(strquery, {}, function(err, data) {
          _callback(null,data);
        });
      };
      async.mapSeries(emissions,emissionFunc,callback);
    };
    async.mapSeries(charts,dimFunc,function(err,data){
      maincallback(err,data)
      self.parent.emission = emissionOri;
    })
    
    
    
    
    // const dimFunc = function(chart,callback){
      
    //   const dim =chart.dim
    //   console.log(chart)
    //   const emissionFunc=function(emission,_callback){
    //     const querystring = "SELECT {0} as key0,SUM({1}) AS {1} FROM {2} WHERE {3}{1} IS NOT NULL GROUP BY key0 ORDER BY {1}"
    //                         .format(dim,emission.name,table,filtersstr);        
    //     console.log(dim,emission.name,table)
    //     console.log(querystring)
    //     self.con.query(querystring, {}, function(err, data) {
    //       if(err)console.log(err);
    //       _callback(data);
    //     });
    //   };
    //   async.map(emissions,emissionFunc,function(err,data){
    //     callback(data)
    //   });
    // };
    // async.map(charts,dimFunc,function(err,data){
    //   maincallback(err,data)
    // })
    

    // console.log(querystring)
    
   
    
    
    
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



//
    // const maplayer=this.mapLayer,emission=this.emission,table=this.tablename;
    // const query =`SELECT {0},sum({1}) AS {1} FROM table5 WHERE lng>={2} AND lng<={3} AND lat>={4} AND lat<={5}  GROUP BY {0};`.format(maplayer,emission,table,minx,maxx,miny,maxy);

    // this.parent.geomaps[this.mapLayer].dc.group.all(function(err,data){self.parent.mapContainer.updateHexPaint(data)});
    // self.mapContainer.updateHexPaint(data)
    // const self = this;
    // this.con.query(query, {}, function(err, data) {
    //   self.mapContainer.updateHexPaint(data)
    // });


// getMap
        // const obj = {mapLayer:self.mapLayer,center:center};
      
      // this.parent.socket.emit("moving",obj);
  // self.parent.geomaps[self.mapLayer].dc.group.all(function(err,array){
  //       const data = array.map(item=>{
  //         return {gid:item.key0,value:item[emission],color:self.xscale(item[emission])};
  //         })
  //       self.parent.mapContainer.updateHexPaint(data)
  //     });

// OLD
    // this.parent.geomaps[this.mapLayer].dc.group.sizeAsync().then(function(size){
      // const steps=Math.ceil(size / 10000.0);
      // const array=range(steps)
      // console.log(size,steps)
      // self.parent.mapContainer.resetStops();
      // self.filterMap(self.parent.mapContainer.bounds);
      // console.time("download")
      // self.parent.geomaps[self.mapLayer].dc.group.all(function(err,data){console.timeEnd("download");self.parent.mapContainer.updateHexPaint(data)});
      
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
    // });
    // this.parent.geomaps[this.mapLayer].dc.group.all(function(err,data){self.parent.mapContainer.updateHexPaint(data)});
  
    
// queueSetup
      // const endFunc = function(){
    //   console.log("END of Queue");
    //   const cache=self.cache[self.mapLayer];
    //   for(let gid in cache){if(!(cache[gid].inside))delete cache[gid];}
    //   self.geomaps[self.mapLayer].dc.dimension.filterAll();
    // };
    // const queueFunc=function(obj,callback){
    //   self.queueFunc(obj,callback);
    // };
    // const q = this.queue = async.queue(queueFunc, 2);
    
    // q.drain = endFunc;
  // getMapSetup:function(){
  //   const self=this;
  //   const socket = this.parent.socket;
  //   socket.on('moving', function(obj){
  //     const cache=self.cache[obj.mapLayer];
  //     for(let gid in cache){cache[gid].inside=false;}
      
  //     // obj.groups.forEach(group=>{
  //       let requestids=[];
  //       obj.array.forEach(gid=>{
  //           const obj=cache[gid];
  //           if(obj){cache[gid].inside=true}
  //           else{requestids.push(gid);}
  //       });
  //       // console.log("queue push")
  //       // if(requestids.length)self.queue.push({array:requestids},function(data){
  //       //   self.updateData(data);
  //       // });
  //       if(requestids.length)self.queueFunc(requestids,function(data){
  //         console.log("queueFunc end")
  //         for(let gid in cache){if(!(cache[gid].inside))delete cache[gid];}
  //         self.updateData(data);
  //       });
  //     });
  //   // });
    
  // },
  
  
  
    // queueFunc:function(obj,callback){
    // const self=this;
    // let querystring = self.geomaps[self.mapLayer].dc.group.writeTopQuery(50);

    
    
          // querystring = "SELECT {0} as key0,SUM({1}) AS {1},DISTANCE_IN_METERS(lng,lat,{3},{4}) as dist FROM {2} WHERE {1} IS NOT NULL GROUP BY key0,lng,lat ORDER BY dist LIMIT {5}"
      //                       .format(dim,this.emission,table,obj.lng,obj.lat,limit)

      // ids=ids.slice(0,700);
      // console.log(ids)
      // let arr=ids.map(id=>'{0}={1}'.format(self.geomaps[self.mapLayer].dim,id));
      // arr=arr.join(" OR ");
      // querystring=querystring.replace("WHERE","WHERE ({0}) AND".format(arr));
      // console.log(querystring)
      // let str = "DISTANCE_IN_METERS(lng,lat,{0},{1})<1000000".format(obj.lng,obj.lat)
    
          // querystring=querystring.replace("FROM",",{0} as dist FROM".format(str));
      // querystring=querystring.replace("WHERE","ORDER BY nox DESC LIMIT 10000".format(str));
      // console.log(str)
    
    // this.parent.geomaps[this.mapLayer].dc.group.all(function(err,data){self.parent.mapContainer.updateHexPaint(data)});
    // self.mapContainer.updateHexPaint(data)
    // const self = this;
    // this.con.query(query, {}, function(err, data) {
    //   self.mapContainer.updateHexPaint(data)
    // });
    
    
    
    // console.log( self.geomaps[self.mapLayer].dc.group.writeTopQuery())
    // // self.geomaps[self.mapLayer].dc.group.setBoundByFilter([334215]);
    //   self.geomaps[self.mapLayer].dc.group.topAsync(10).then(function(data){
      
    //   // if(array)self.geomaps[self.mapLayer].dc.dimension.filterAll();
    //   callback(data);
    // });
    
    
    
    // self.geomaps[self.mapLayer].dc.group.topAsync(10).then(function(data){
    //   // console.log(err)
    //   console.log(data)
    //   // if(array)self.geomaps[self.mapLayer].dc.dimension.filterAll();
    //   callback(data);
    // });
    
    
    // self.geomaps[self.mapLayer].dc.group.topAsync(10).then(function(data){
    //   console.log(data)
    //   // if(array)self.geomaps[self.mapLayer].dc.dimension.filterAll();
    //   callback(data);
    // });
    
  // },