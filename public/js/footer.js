/*global $,extend,localStorage*/
function Footer(parent,options){
  this._parent = parent;
  
  this.options = extend(Object.create(this.options), options);
  this.active= false;
  this.construct();
}
Footer.prototype ={
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  options:{container:""
    
  },
  constructFunc:function(){
    let dragElement = $('.handle');
    const self = this;
    dragElement.on('mousedown touchstart', function(e) {
      // e.preventDefault();
      dragElement.addClass('draggable');
      dragElement.parent().addClass('draggable');
      let height = dragElement.parent().height();
      let startY = (e.pageY) ? e.pageY : e.originalEvent.touches[0].pageY;
      self.deltaY = $(document).height()-startY-height;
      self.active= true;      
    });
    dragElement.parents().on("mousemove touchmove", function(e) {
      // e.preventDefault();
    	if(self.active){
        // e.preventDefault();
        let moveY = (e.pageY) ? e.pageY : e.originalEvent.touches[0].pageY;
        let height = $(document).height()-moveY-self.deltaY;
        let maxH = $(document).height()*.5;
        height = (height<49)?49:height;
        height = (height> maxH)?maxH:height;
        dragElement.parent().css('height', height + "px");
        
      }
    });
    dragElement.parents().on("mouseup touchend touchcancel", function(e) {
    	if(self.active){
        dragElement.removeClass('draggable');
        dragElement.parent().removeClass('draggable');
        self.active=false;
      }
    });
  },  
  construct:function(){
    if(this.parent.debug)console.log("Constructing Header")
    this.render();
    this.constructFunc();
  },
  render:function(){
    $('.footer').append(this.html());
    this.dropdownMenuFunc('emission');
    this.dropdownMenuFunc('unit');
    // $('[data-toggle="tooltip"]').tooltip();
    // $(".LGbtn2").click(this.changeLanguage);
    // this.postrender();
  },
  dropdownMenu:function(name,list,title){
    let lis=list.map(item=>`<li><a href="#" _id="{0}">{1}</a></li>`.format(item.name,item.dname)).join("");
    let ul = `<ul class="dropdown-menu" id="ul_{0}">{1}</ul>`.format(name,lis);
    let html =`<div class="btn-group dropup">
                <div class="number-display number" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{1}</div>
                  {0}
               </div>`.format(ul,title);               
    return html;
  },
  dropdownMenuFunc:function(name){
    const self=this;
    $("#ul_{0}s li a".format(name)).click(function(){
      let selText = $(this).text();
      $(this).closest('div').children('div').text(selText);
      var _id = $(this).attr('_id');
      self.parent[name] = _id;
      
    });
  },
  html:function(){
    const emissions=this.parent.options.emissions;
    const units=this.parent.options.units;
    const emission = this.parent.emission;
    const divider = this.parent.divider;
    const emissionT = this.parent.emissions.find(item=>item.name===emission).dname;
    const unitT = this.parent.units.find(item=>item.divider===divider).dname;
    return `<div class="handle"></div>
            <div class="footer-title">
              <div class="row">
                <div class="col-sm-8">
                  <span class="number-display">Total</span>
                  {0}
                  <span class="number-display">&nbsp: </span>
                  <div class="number-display" id="totalnumber"></div>
                  {1}
                </div>
                <div class="col-sm-4">
                </div>
              </div>
            </div>
          <div class="gridContainerParent">
            <div class="gridContainer"></div>
          </div>
            `.format(this.dropdownMenu('emissions',emissions,emissionT),
                     this.dropdownMenu('units',units,unitT)
                     )
  },
}

function Slider(){
  this.active= false;
  this.construct();
}
Slider.prototype ={

}
