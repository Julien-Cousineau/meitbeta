/*global $,extend,localStorage*/
function LeftSide(parent,options){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
  this.construct();
}
LeftSide.prototype ={
  get container(){return this.options.container;},
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  options:{container:""
    
  },
  construct:function(){
    if(this.parent.debug)console.log("Constructing Header")
    this.changeLanguage = this.parent.changeLanguageToggle;
    
    this.render();
  },
  render:function(){
    $('#header').append(this.getDiv());
    $(".LGbtn2").click(this.changeLanguage);
    this.postrender();
  },
  
}