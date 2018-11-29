/*global extend,dc */

function Chart(parent,options,callback){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
  // this.callback=callback;
  this.createChart(function(){
    callback();
  });
}

Chart.prototype = {
  options:{
    dim:'',
    dctype:'',
    colorScheme:["#22A7F0", "#3ad6cd", "#d4e666"],
  },
  defaultChartAttributes:{
    pieChart:{cap:25,othersGrouper:false},
    rowChart:{cap:25,autoScroll:true,elasticX:true,margins:{top:10,right:50,bottom:50,left:10},othersGrouper:false},
    barChart:{elasticX:true,elasticY:true},
  },
  defaultChartAttributesFunc:{
    barChart:{},
    rowChart:{},
    barChart:{},
    
             
    
    
  },
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get crossFilter(){return this.parent.crossFilter;},
  get emission(){return this.parent.emission;},
  get divider(){return this.parent.divider;},
  get reduceFunc(){return this.parent.reduceFunc;},
  get reduceTrendFunc(){return this.parent.reduceTrendFunc;},
  
  get attributes(){
    if(!this._attributes){
      this._attributes = extend(Object.create(this.defaultChartAttributes[this.dctype]),this.options.attributes);
    }
    return this._attributes
  },
  get attributesFunc(){
    if(!this._attributesFunc){
      if(this.options.attributesFunc){
      this._attributesFunc = extend(Object.create(this.options.attributesFunc), this.defaultChartAttributesFunc[this.dctype]);
      } else {
        this._attributesFunc = this.defaultChartAttributesFunc[this.dctype];
      }
      
    }
    return this._attributesFunc
  },
  get dctype(){return this.options.dctype;},
  get id(){return this.options.id;},
  get dim(){return this.options.dim;},
  get dimension(){
    if(!(this._dimension))this._dimension =this.crossFilter.dimension(this.dim);
    return this._dimension;
  },
  get minMaxFunc(){return [{expression: this.dim,agg_mode:"min",name: "minimum"},
                           {expression: this.dim,agg_mode:"max",name: "maximum"},
                           ]},
  get minMax(){return this.options.minMax;},
  set minMax(value){this.options.minMax=value;},
  get container(){return "._" + this.id;},
  get colorScheme(){return this.options.colorScheme;},
  // get group(){return this.dimension.group().reduce(this.reduceFunc);}, 
  get group(){
    if(!(this._group)){
      if(this.id=="paneltrend"){
        this._group=this.crossFilter.groupAll().reduce(this.reduceTrendFunc);
        // this.crossFilter.groupAll().reduceMulti(this.reduceFunc);
      } else {
        this._group=this.dimension.group().reduce(this.reduceFunc);
      }
    }
    return this._group;
  },
  changeGroup(){
    
    // console.log(this.group)
    // this.dc.group(this.group);
    if(this.id=="paneltrend"){
      this.group.reduce(this.reduceTrendFunc);
    }
    else{
    this.group.reduce(this.reduceFunc);
    }
  },
  removeFilters:function(){
    this.dc.filterAll();
    this.removeReset();
  },
  removeReset:function(){
     const self=this;
     $('div[panelid="{0}"] .x_title .nav .resetbtnli'.format(this.id)).css(`visibility`,"hidden");
     if(this.id=="panelmeit")this.parent.mapContainer.filteredids=[];
     dc.redrawAllAsync();
  },
  addReset:function(){
    const self=this;
    $('div[panelid="{0}"] .x_title .nav .resetbtnli'.format(this.id)).css("visibility","visible");
    $('div[panelid="{0}"] .x_title .nav .resetbtn'.format(this.id)).one("click",function(){self.removeFilters();});
  },
  filteredFunc:function(chart,filter){
    const self=this;
    
    
    
    this.parent.pillcontainer.forEach(pill=>{if(pill.panel==this.id)pill.active=false;})
    const pill=this.parent.pillcontainer.find(pill=>pill.panel==this.id &&pill.filter==filter.toString());
    if(!(pill) && chart.filters().length>0){
      
      $('.pillcontainer').append(`<span class="badge badge-pill badge-filter" _panel="{0}" _filter="{1}">{0}:{1} <i class="fa fa-times"></i></span>`.format(this.id,filter.toString()))
      // $(`[_panel="{0}"][_filter="{1}"]`.format(this.id,filter.toString())).on("click",function(){
      //   const _filters  =chart.filters().filter(_filter=>_filter!=$(this).attr("_filter"))
      //   console.log(_filter)
      //   self.dc.filter(_filters);
      // })
      this.parent.pillcontainer.push({panel:this.id,filter:filter.toString(),active:true})
    }
    chart.filters().forEach(_filter=>{
      this.parent.pillcontainer.find(pill=>pill.panel==this.id &&pill.filter==_filter.toString()).active=true;
    })
    this.parent.pillcontainer=this.parent.pillcontainer.reduce((acc,pill)=>{
      if(pill.active==false){
        $(`[_panel="{0}"][_filter="{1}"]`.format(this.id,pill.filter)).remove();
        return acc;
      }
      acc.push(pill);
      return acc;
    },[]);
    
    
    if(chart.filters().length===0){this.removeReset();}
    else{this.addReset();}
    // console.log(this.group.getReduceExpression())
    this.parent.getTotalMap();
    // this.parent.getMapValue();
    if(this.parent.pillcontainer.length>0)$('.filterpanel .inside').addClass("active");
    if(this.parent.pillcontainer.length==0)$('.filterpanel .inside').removeClass("active");
  },
  // preCreateChart:function(){
  //   const self=this;
  //   if(this.dctype==="barChart"){
      
  //     this.crossFilter
  //       .groupAll()
  //       .reduceMulti(this.minMaxFunc)
  //       .valuesAsync(true).then(function(minMax) {
  //           self.minMax=minMax;
  //           self.createChart();
  //       });
          
  //   } else {
  //     self.createChart();
  //   }
    
  // },
  getMinMax:function(callback){
    const self=this;
    this.crossFilter
         .groupAll()
         .reduceMulti(this.minMaxFunc)
         .valuesAsync(true).then(function(minMax) {
            self.minMax=minMax;
            callback();
         });
  },
  // rowChart:function(callback){this.createChart(function(){callback();});},
  // pieChart:function(callback){this.createChart(function(){callback();});},
  // barChart:function(callback){
  //   const self=this;
  //   this.createChart(function(){
  //     // self.dc.yAxis().ticks(5);
  //     // self.dc.xAxis()
  //     //       .scale(self.dc.x())
  //     //       .tickFormat(self.attributes.xAxis.tickFormat)
  //     //       // .tickFormat(function(p) { return names[p]; })
  //     //         // .tickFormat(dc.utils.customTimeFormat)
  //     //       .orient('bottom');
  //     callback();
  //   });
  // },
  createChart:function(callback){
    const self=this;
    if(this.options.getMinMax){
      this.getMinMax(function(){self._createChart();callback();})}
    else{self._createChart();callback();}
  },
  _createChart:function(){
    const self = this;
    const width = $('div[panelid="{0}"] .x_content'.format(this.id)).width();
    const height = $('div[panelid="{0}"] .x_content'.format(this.id)).height();
    // console.log(this.group.writeTopQuery())
    this.dc = dc[this.dctype](this.container)
                .height(height)
                .width(width)
                .ordinalColors(this.colorScheme)
                .dimension(this.dimension)
                
                .on("filtered",function(chart, filter){self.filteredFunc(chart,filter);})
                
    
    if(this.id=="paneltrend"){
      function remove_empty_bins(source_group) {
          return {
              topAsync:function () {
                  return new Promise(function(resolve,reject){
                    source_group.valuesAsync().then(data=>{
                      
                      resolve([
                        {key0:'2015',value:data.year2015},
                        {key0:'2020',value:data.year2020},
                        {key0:'2025',value:data.year2025},
                        {key0:'2030',value:data.year2030},
                        {key0:'2035',value:data.year2035},
                        {key0:'2040',value:data.year2040},
                        {key0:'2045',value:data.year2045},
                        {key0:'2050',value:data.year2050}
                      ]);
                    })
                  })
                  
              },
              all:function(callback){
                // return [{key0:'2015',value:1000}]
                source_group.valuesAsync().then(data=>{
                  
                  callback(false,
                  [
                    {key0:'2015',value:data.year2015},
                    {key0:'2020',value:data.year2020},
                    {key0:'2025',value:data.year2025},
                    {key0:'2030',value:data.year2030},
                    {key0:'2035',value:data.year2035},
                    {key0:'2040',value:data.year2040},
                    {key0:'2045',value:data.year2045},
                    {key0:'2050',value:data.year2050}
                    ]
                  )
                });
                
                // new Promise(function(resolve,reject){
                    // source_group.valuesAsync().then(data=>{
                      
                    //   callback([
                    //     {key0:'2015',value:data.year2015},
                    //     {key0:'2020',value:data.year2020},
                    //     {key0:'2025',value:data.year2025},
                    //     {key0:'2030',value:data.year2030},
                    //     {key0:'2035',value:data.year2035},
                    //     {key0:'2040',value:data.year2040},
                    //     {key0:'2045',value:data.year2045},
                    //     {key0:'2050',value:data.year2050}
                    //   ]);
                    // })
                  // })
              }
          };
      }
      // this.dc.ordering=null;
      this.dc.group(remove_empty_bins(this.group))
      // this.dc.keyAccessor(function (p) {console.log(p);return p.key;});
      this.dc.valueAccessor(function (p) {return p.value/self.divider;});
      
    } else {
      this.dc.group(this.group)
      this.dc.valueAccessor(function (p) {return p[self.emission]/self.divider;});
    }
    
    //if(this.id=="panelmeit"){
    //  let setScales = function(chart, type){
    //    chart.on(type, function(chart) {         
          //chart.y(d3.scale.log().domain(d3.extent(chart.data(), chart.valueAccessor()))); 
    //      const value=d3.extent(chart.data(), chart.valueAccessor())
    //      chart.y(d3.scale.log().domain());        
    //    });
    //  }
    //  setScales(this.dc, "preRender");
    //  setScales(this.dc, "preRedraw");
    
    
    //  const group =this.dc.group()
    //  const rescale=function(chart) {               
    //    let minTop = group.bottom(1)[0][self.emission];
    //    let minimum = minTop > 0 ? minTop : 1;
    //    let maximum = group.top(1)[0][self.emission];
        
    //    chart.y(d3.scale.log().domain([minimum, maximum])
    //      .range(height, 0)
     //     .nice()
    //      .clamp(true));
    //  }
    //  
    //  this.dc.on('preRedraw', (chart) => {
    //    rescale(chart);
    //  });
    //}
    
    
    this.dc.measureValue=function (d) {return self.formatValue(self.dc.cappedValueAccessor(d));};
    // console.log(this.group.getReduceExpression())
    for(let attr in this.attributes){
      
      if(attr=='xAxis' || attr=='yAxis'){
        for(let xattr in this.attributes[attr]){
          this.dc[attr]()[xattr](this.attributes[attr][xattr]);
        }
      }
      else if(attr=='measureValue'){
        // if(this.attributes[attr])
      }
      else{this.dc[attr](this.attributes[attr]);}
    }
    //TODO : Chnage this below...too complicated
    for(let attr in this.attributesFunc){
      const obj = this.attributesFunc[attr];
      for(let key in obj){
        // console.log(key)
        // console.log(this[key])
        const value =obj[key](this[key]);
        
        this.dc[attr](value);
      }
      
    }
    if(this.dc.xAxis)this.dc.xAxis().scale(this.dc.x());
    // if(this.dim=='meit')this.dc.xAxis().scale(d3.scale.ordinal().domain(d3.range(0,22)));
  },
  formatValue:function(x){
    var formatSi = d3.format(".2s");
    var formate = d3.format(".1e");
    var formatf = d3.format(".2n");
    
    if(x<0.001){return formate(x);}
    var s = formatSi(x);
    if(x==0){return s;}
    switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "M": return s.slice(0, -1) + "M";
        case "k": return s.slice(0, -1) + "k";
        case "m": return formatf(x);
        default:return s;
     }
  },
    
}