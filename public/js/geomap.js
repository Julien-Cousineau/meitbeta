/*global extend,dc */

function GeoMap(parent,options,callback){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
  this.callback=callback;
  this.createMapDim();
}

GeoMap.prototype = {
  options:{
    dim:'',
  },
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get crossFilter(){return this.parent.crossFilter;},
  get emissionType(){return this.parent.emissionType;},
  get divider(){return this.parent.divider;},
  get reduceFunc(){return this.parent.reduceFunc;},
  get dim(){return this.options.dim;},
  get dimension(){
    if(!(this._dimension))this._dimension =this.crossFilter.dimension(this.dim);
    return this._dimension;
  },
  get group(){
    if(!(this._group))this._group=this.dimension.group().reduce(this.reduceFunc);
    return this._group;
  },
  createMapDim:function(){
      this.dimension;
      this.group;
  },
  getValue:function(){
    //   console.log(this.group)
      //   console.log(this.group.all());
  }
};