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
    pieChart:{cap:9,othersGrouper:false},
    rowChart:{cap:20,autoScroll:true,elasticX:true,margins:{top:10,right:50,bottom:50,left:10},othersGrouper:false},
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
  
  get attributes(){
    if(!this._attributes){
      this._attributes = extend(Object.create(this.options.attributes), this.defaultChartAttributes[this.dctype]);
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
    if(!(this._group))this._group=this.dimension.group().reduce(this.reduceFunc);
    return this._group;
  },
  changeGroup(){
    
    // console.log(this.group)
    // this.dc.group(this.group);
    this.group.reduce(this.reduceFunc);
  },
  removeFilters:function(){
    this.dc.filterAll();
    this.removeReset();
  },
  removeReset:function(){
     const self=this;
     $('div[panelid="{0}"] .x_title .nav .resetbtnli'.format(this.id)).css(`visibility`,"hidden");
     dc.redrawAllAsync();
  },
  addReset:function(){
    const self=this;
    $('div[panelid="{0}"] .x_title .nav .resetbtnli'.format(this.id)).css("visibility","visible");
    $('div[panelid="{0}"] .x_title .nav .resetbtn'.format(this.id)).one("click",function(){self.removeFilters();});
  },
  filteredFunc:function(chart,filter){
    console.log(chart.group())
    console.log(chart.group().writeTopQuery(10))
    // console.log(this.crossFilter.getFilterString())
    // console.log(this.crossFilter.getFilter())
    // console.log(this.crossFilter.getGlobalFilter())
    // console.log(this.crossFilter.getGlobalFilterString())
    // console.log(this.crossFilter)
    const self=this;
    if(chart.filters().length===0){this.removeReset();}
    else{this.addReset();}
    // console.log(this.group.getReduceExpression())
    this.parent.getTotalMap();
    // this.parent.getMapValue();
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
    console.log("here")
    this.dc = dc[this.dctype](this.container)
                .height(height)
                .width(width)
                .ordinalColors(this.colorScheme)
                .dimension(this.dimension)
                .group(this.group)
                .on("filtered",function(chart, filter){self.filteredFunc(chart,filter);})
                .valueAccessor(function (p) {return p[self.emission]/self.divider;});
    
    this.dc.measureValue=function (d) {return self.formatValue(self.dc.cappedValueAccessor(d));}
    // console.log(this.group.getReduceExpression())
    for(let attr in this.attributes){
      if(attr!=='xAxis' && attr!=='yAxis'){this.dc[attr](this.attributes[attr])}
      else{
        for(let xattr in this.attributes[attr]){
          this.dc[attr]()[xattr](this.attributes[attr][xattr]);
        }
      }
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