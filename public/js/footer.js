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
    
    let exportElement = $('.export');
    exportElement.on("click",function(){return self.parent.ExportC.export();});
    
  },  
  construct:function(){
    if(this.parent.debug)console.log("Constructing Footer")
    this.render();
    this.constructFunc();
  },
  render:function(){
    $('.footer').append(this.html());
    this.dropdownMenuFunc('emission');
    this.dropdownMenuFunc('unit');
    this.dropdownMenuFunc('year');
    this.dropdownObj('table');
    this.dropdownObj('chart');
    this.dropdownObj('gis');
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
  dropdownObj:function(type){
    const self=this;
    const name='menufor' + type;
    $('.dropdown-menu.{0} li'.format(name)).on( 'click', function( event ) {

      const $target = $( event.currentTarget ),
            panelid = $target.attr( 'panelid' ),
            $inp = $target.find( 'input' );
      if(type==="gis" || type==="table")$('.dropdown-menu.{0} li input'.format(name)).prop("checked",false);
      if(type==="gis")self.parent.mapContainer.changeLayer(panelid);
      if(type==="table")self.parent.table=panelid;
      
      $inp.prop("checked", !$inp.prop("checked"));
      const $panel=$('.x_panel_container[panelid={0}]'.format(panelid));
      // setTimeout( function() { $inp.prop("checked", !$inp.prop("checked")) }, 0);
      // $panel.toggleClass("show hide");
      $inp.prop("checked")?$panel.show():$panel.hide();

      $( event.target ).blur();
      return false; //to keep dropdown open!important
    });
    
  },
  dropdownMenuFunc:function(name){
    const self=this;
    $("#ul_{0}s li a".format(name)).click(function(){
      let selText = $(this).text();
      $(this).closest('div').children('div').text(selText);
      var _id = $(this).attr('_id');
      self.parent[name] = _id;
      self.parent.refresh();
      
    });
  },
  htmlli:function(obj){
    const language = this.parent.language;
    const keywords = this.parent.keywords;
    
    return obj.map(item=>{
      const id = (item.id)?item.id:item.name;
      const keyword = (item.keyword)?keywords[item.keyword][language]:item.name;
      const checked = (item.checked)?'checked':"";
      return `<li class="list-group-item" panelid="{0}">
                {1}
                <div class="material-switch pull-right">
                    <input id="switch_{0}" type="checkbox" {2}/>
                    <label for="switch_{0}" class="switch-color"></label>
                </div>
              </li>`
            .format(id,keyword,checked);
    }).join("");
  },
  html:function(){
    const emissions=this.parent.options.emissions;
    const units=this.parent.options.units;
    const years=this.parent.options.years;
    const emission = this.parent.emission;
    const divider = this.parent.divider;
    const year = this.parent.year;
    const emissionT = this.parent.emissions.find(item=>item.name===emission).dname;
    const unitT = units.find(item=>item.divider===divider).dname;
    const yearT = years.find(item=>item.name===year).dname;
    const tablelis = this.htmlli(this.parent.tables);
    const gislis = this.htmlli(this.parent.gis);
    const chartlis = this.htmlli(this.parent.charts);
    
    
    
    return `<div class="handle"></div>
            <div class="footer-title">
              <div class="row">
                <div class="col-sm-8">
                  <span class="number-display">Total</span>
                  {0}
                  <span class="number-display">&nbsp: </span>
                  <div class="number-display" id="totalnumber"></div>
                  {1}
                  <span>&nbsp(</span>
                  {2}
                  <span>)</span>
                </div>
                <div class="col-sm-4">
                  <ul class="nav navbar-right panel_toolbox">
                    <li>
                      <a class="dropdown-toggle foorterbtn" id="dropdownMenuTable" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fa fa-database fa-2x" aria-hidden="true"></i></a>
                      <div class="dropdown-menu dropdown-menu-right menufortable" aria-labelledby="dropdownMenuTable" x-placement="bottom-start" >
                        <ul class="list-group">
                         {3}
                        </ul>
                      </div>
                    </li>                     
                    <li>
                      <a class="dropdown-toggle foorterbtn" id="dropdownMenuGIS" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fa fae-layers fa-2x" aria-hidden="true"></i></a>
                      <div class="dropdown-menu dropdown-menu-right menuforgis" aria-labelledby="dropdownMenuGIS" x-placement="bottom-start" >
                        <ul class="list-group">
                         {4}
                        </ul>
                      </div>
                    </li>                  
                    <li>
                      <a class="dropdown-toggle foorterbtn" id="dropdownMenuChart" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fa fa-bar-chart fa-2x" aria-hidden="true"></i></a>
                      <div class="dropdown-menu dropdown-menu-right menuforchart" aria-labelledby="dropdownMenuChart" x-placement="bottom-start" >
                        <ul class="list-group">
                          {5}
                        </ul>
                      </div>
                    </li>
                    <li>
                      <a class="foorterbtn export">
                        <i class="fa fa-table fa-2x" aria-hidden="true"></i>
                        <i class="fa fa-circle mpicon circle" aria-hidden="true"></i>
                        <i class="fa fa-download mpicon download" aria-hidden="true"></i>
                      </a>
                    </li>
                  </ul>
                  </div>
                </div>
              </div>
            </div>
          <div class="gridContainerParent">
            <div class="gridContainer"></div>
          </div>
            `.format(this.dropdownMenu('emissions',emissions,emissionT),
                     this.dropdownMenu('units',units,unitT),
                     this.dropdownMenu('years',years,yearT),
                     tablelis,
                     gislis,
                     chartlis
                     )
  },
}

function Slider(){
  this.active= false;
  this.construct();
}
Slider.prototype ={

}
