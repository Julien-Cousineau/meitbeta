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
        let maxH = $(document).height()-250;
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
    
    // let exportElement = $('.export');
    // exportElement.on("click",function(){return self.parent.ExportC.export();});
    
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
    const self=this;
    $('.clearpanel2').on("click",function(){self.clear();})
    // this.removetooltip();
    // $('[data-toggle="tooltip"]').tooltip();
    // $(".LGbtn2").click(this.changeLanguage);
    // this.postrender();
  },
  clear:function(){
    for(let id in this.parent.geomaps){
      this.parent.mapd.filterbyID(id,[]);
      this.parent.mapContainer.filteredids=[];
    }
    for(let id in this.parent.charts){
      const chart=this.parent.charts[id];
      chart.dc.removeFilters();
    }
  },
  removetooltip:function(){
    // $('.dropdownbtn').on("click",function(e){$('[data-toggle="tooltip"]').tooltip('hide');});
   
    
  },
  dropdownMenu:function(name,list,title,tooltip){
    let lis=list.map(item=>`<li><a href="#" _id="{0}" keyword="{0}" keywordType="text">{1}</a></li>`.format(item.id,item.keyword)).join("");
    let ul = `<ul class="dropdown-menu" id="ul_{0}">{1}</ul>`.format(name,lis);
    let html =`<div class="btn-group">
                <div data-toggle="dropdown" data-toggle="tooltip" data-placement="top" title="{2}" keyword="{2}" keywordType="title">
                  <div class="number-display number" aria-haspopup="true" aria-expanded="false" keyword="" keywordType="{1}" >{1}</div>
                </div>
                  {0}
               </div>`.format(ul,title,tooltip);               
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
      const id = (item.id)?item.id:item.id;
      const keyword = (item.keyword)?item.keyword:item.id;
      const value = (item.keyword)?keywords[item.keyword][language]:item.id;
      const checked = (item.checked)?'checked':"";
      return `<li class="list-group-item" panelid="{0}">
                <span keyword="{1}" keywordType="text">{2}</span>
                <div class="material-switch pull-right">
                    <input id="switch_{0}" type="checkbox" {3}/>
                    <label for="switch_{0}" class="switch-color"></label>
                </div>
              </li>`
            .format(id,keyword,value,checked);
    }).join("");
  },
  updateTableList:function(){
    const tablelis = this.htmlli(this.parent.publictables);
    $('.menufortable ul').empty();
    $('.menufortable ul').append(tablelis)
  },
  html:function(){
    const emissions=this.parent.options.emissions;
    const units=this.parent.options.units;
    const years=this.parent.options.years;
    const emission = this.parent.emission;
    const divider = this.parent.divider;
    const year = this.parent.year;
    const emissionT = this.parent.emissions.find(item=>item.id===emission).keyword;
    const unitT = units.find(item=>item.divider===divider).keyword;
    const yearT = years.find(item=>item.id===year).keyword;

    const tablelis = this.htmlli(this.parent.publictables);
    const gislis = this.htmlli(this.parent.gis);
    const chartlis = this.htmlli(this.parent.charts);
    
    
    
    return `<div class="handle"></div>
            <div class="filterpanel">
              <div class="inside">
                
                <div class="footer-title">
                  
                      <h5 style="display: inline;">Filters</h5>
                  <a class="clearpanel2" style="float: right;color: #007bff;"  keyword="clear" keywordType="text">clear</a>
                </div>
                <div class="pillcontainer">
                  
                </div>
                
              </div>
            </div>
              
            
            
            <div class="footer-title">
            <div class="container-fluid">
              <div class="row">
                <div class="col-sm-8">
                  <span class="number-display"></span>
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
                    <li data-toggle="tooltip" data-placement="top" title="database" keyword="database" keywordType="title">
                      <a class="dropdown-toggle  foorterbtn" id="dropdownMenuTable" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-database fa-2x" aria-hidden="true"></i></a>
                      <div class="dropdown-menu  dropdown-menu-right menufortable" aria-labelledby="dropdownMenuTable" x-placement="bottom-start" >
                        <ul class="list-group">
                         {3}
                        </ul>
                      </div>
                    </li>                     
                    <li title="gis" keyword="gis" keywordType="title">
                      <a class="dropdown-toggle foorterbtn" id="dropdownMenuGIS" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="far fae-layers fa-2x" aria-hidden="true"></i></a>
                      <div class="dropdown-menu  dropdown-menu-right menuforgis" aria-labelledby="dropdownMenuGIS" x-placement="bottom-start" >
                        <ul class="list-group">
                         {4}
                        </ul>
                      </div>
                    </li>                  
                    <li title="charts" keyword="charts" keywordType="title">
                      <a class="dropdown-toggle foorterbtn" id="dropdownMenuChart" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-chart-bar fa-2x" aria-hidden="true"></i></a>
                      <div class="dropdown-menu  dropdown-menu-right menuforchart" aria-labelledby="dropdownMenuChart" x-placement="bottom-start" >
                        <ul class="list-group">
                          {5}
                        </ul>
                      </div>
                    </li>
                    <li title="export" keyword="export" keywordType="title">
                      <a class="foorterbtn export" data-toggle="modal" data-target="#exportModal">
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
            </div>
          <div class="gridContainerParent">
            <div class="gridContainer"></div>
          </div>
            `.format(this.dropdownMenu('emissions',emissions,"emission","emissions"),
                     this.dropdownMenu('units',units,"unit","unit"),
                     this.dropdownMenu('years',years,"year","forecastyear"),
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
