/*global extend,dc */

function Chart(parent,options){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
  this.createChart();
}

Chart.prototype = {
  options:{
    dim:'',
    dctype:'',
    colorScheme:["#22A7F0", "#3ad6cd", "#d4e666"],
  },
  pieoptions:{cap:9},
  defaultChart:{
    pieChart:{cap:9},
    rowChart:{cap:20,othersGrouper:false,autoScroll:true},
    barChart:{},
  },
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get crossFilter(){return this.parent.crossFilter;},
  get emissionType(){return this.parent.emissionType;},
  get divider(){return this.parent.divider;},
  get reduceFunc(){return this.parent.reduceFunc;},
  
  get attributes(){
    if(!this._attributes){
      this._attributes = extend(Object.create(this.options.attributes), this.defaultChart[this.dctype]);
    }
    return this._attributes
  },
  get dctype(){return this.options.dctype;},
  get dim(){return this.options.dim;},
  get dimension(){return this.crossFilter.dimension(this.dim);},
  get container(){return "._" + this.dim;},
  get colorScheme(){return this.options.colorScheme;},
  get group(){return this.dimension.group().reduce(this.reduceFunc);}, 

  createChart:function(){
    const self = this;
    console.log(this.container)
    this.dc = dc[this.dctype](this.container)
                .height(300)
                .width(300)
                .ordinalColors(this.colorScheme)
                .measureLabelsOn(true)
                .dimension(this.dimension)
                .group(this.group)
                .valueAccessor(function (p) {return p[self.emissionType];});
    console.log(this.attributes)                
    for(let attr in this.attributes){
      console.log(attr,this.attributes[attr])
      this.dc[attr](this.attributes[attr]);
    }
  },
    
}