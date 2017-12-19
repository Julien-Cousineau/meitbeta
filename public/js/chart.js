/*global extend,dc */

function Chart(parent,options,callback){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
  this.callback=callback;
  this.preCreateChart();
}

Chart.prototype = {
  options:{
    dim:'',
    dctype:'',
    colorScheme:["#22A7F0", "#3ad6cd", "#d4e666"],
  },
  pieoptions:{cap:9},
  defaultChartAttributes:{
    pieChart:{cap:9,othersGrouper:false},
    rowChart:{cap:20,autoScroll:true,elasticX:true,margins:{top:10,right:50,bottom:30,left:10},othersGrouper:false},
    barChart:{elasticX:true,elasticY:true},
  },
  defaultChartAttributesFunc:{
    barChart:{binParams:{minMax:function(minMax){return {numBins: 400,binBounds: [minMax.minimum,minMax.maximum]};}},
              x:{minMax:function(minMax){return d3.time.scale.utc().domain([minMax.minimum,minMax.maximum]) }},
             },
    
             
    
    
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
  get container(){return "._" + this.dim;},
  get colorScheme(){return this.options.colorScheme;},
  // get group(){return this.dimension.group().reduce(this.reduceFunc);}, 
  get group(){
    if(!(this._group))this._group=this.dimension.group().reduce(this.reduceFunc);
    return this._group;
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
    if(chart.filters().length===0){this.removeReset();}
    else{this.addReset();}
    this.parent.getMapValue();
  },
  preCreateChart:function(){
    const self=this;
    if(this.dctype==="barChart"){
      
      this.crossFilter
         .groupAll()
         .reduceMulti(this.minMaxFunc)
         .valuesAsync(true).then(function(minMax) {
            self.minMax=minMax;
            self.createChart();
         });
          
    } else {
      self.createChart();
    }
    
  },
  createChart:function(){
    const self = this;
    const width = $('div[panelid="{0}"] .x_content'.format(this.id)).width();
    const height = $('div[panelid="{0}"] .x_content'.format(this.id)).height();
    this.dc = dc[this.dctype](this.container)
                .height(height)
                .width(width)
                // .minHeight(100)
                // .minWidth(100)
                .ordinalColors(this.colorScheme)
                .measureLabelsOn(true)
                .dimension(this.dimension)
                .group(this.group)
                .on("filtered",function(chart, filter){self.filteredFunc(chart,filter);})
                .valueAccessor(function (p) {return p[self.emission]/self.divider;});
    
    for(let attr in this.attributes){
      this.dc[attr](this.attributes[attr]);
    }
    for(let attr in this.attributesFunc){
      const obj = this.attributesFunc[attr];
      for(let key in obj){
        const value =obj[key](this[key]);
        console.log(value)
        this.dc[attr](value);
      }
      
    }
    if(this.dctype==="barChart"){
      this.dc.yAxis().ticks(5);
      this.dc.xAxis()
              .scale(this.dc.x())
              .tickFormat(dc.utils.customTimeFormat)
              .orient('bottom');
    }
    
    this.callback();
  },
    
}