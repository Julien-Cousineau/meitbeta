

function Grid(parent){
  this._parent = parent;
  this.construct()

    
}
Grid.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  construct:function(){

    
    $('.gridContainer').empty().append(this.renderRow(this.parent.charts));
    this.panelFunc();
    
    
  },
  panelFunc:function(){
    $(".collapse-link").on("click",function(){
      var a=$(this).closest(".x_panel")
      var b=$(this).find("i")
      var c=a.find(".x_content")
      a.attr("style")?c.slideToggle(200,function(){a.removeAttr("style")}):(c.slideToggle(200),a.css("height","auto"));
      b.toggleClass("fa-chevron-up fa-chevron-down")
    });
    $(".close-link").click(function(){
      var a=$(this).closest(".x_panel_container");
      a.hide();
      const panelid=a.attr("panelid");
      const $target=$('.dropdown-menu.menuforchart li[panelid={0}]'.format(panelid));
      const $inp = $target.find( 'input' );
      $inp.prop("checked", !$inp.prop("checked"))
    });
  },
  renderPanelContent:function(id){
    return `<div class="forchart {0}"></div>`.format("_" + id);
  },
  renderPanelTitle:function(panel){
    const keyword = panel.keyword;
    const charts = this.parent.charts;
    // const keywords = this.parent.keywords;
    let panelcontent="";
    // console.log(panel.dimensionids)
    // if(panel.dimensionids.length>1){
    //   let htmltab = panel.dimensionids.map((id,i)=>{
    //     const chart=charts[id];
    //     return `<li {2}><a data-toggle="tab" class="badge badge-secondary" href="#{0}">{1}</a></li>`.format('tab_'+id,keywords[chart.keyword].en,(i===0)?'class="active"':'');
    //   });
    //   panelcontent += `<ul class="nav nav-pills">` + htmltab.join("") + "</ul>";
    //   console.log(panelcontent)
      
    //   let htmlcontent=panel.dimensionids.map((id,i)=>{
    //     const chart=charts[id];
    //     return `<div id="{0}" class="tab-pane fade in active">{1}</div>`.format('tab_'+id,this.renderPanelContent(id));
    //   },this);
    //   panelcontent +=`<div class="tab-content">` + htmlcontent.join("") +`</div>`;
    //   console.log(panelcontent)
    // } else {
    //   panelcontent=this.renderPanelContent(panel.dimensionids[0]);
    // }
    panelcontent=this.renderPanelContent(panel.id);
    
    return `
        <div class="col-xl-3 col-lg-4 col-md-6 col-sm-12 x_panel_container show" panelid="{0}">
          <div class="x_panel tile fixed_height_320">
            <div class="x_title">
              <h2 keyword="{1}" keywordType="text">{1}</h2>
              <ul class="nav navbar-right panel_toolbox">
                <li class="resetbtnli" style="visibility: hidden"><a class="resetbtn"><i class="fa fa-filter"></i><i class="fa fa-times xicon"></i></a></li>
                <li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a>
                </li>
                <li class="dropdown">
                  <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><i class="fa fa-wrench"></i></a>
                  <ul class="dropdown-menu" role="menu">
                    <li><a href="#">Settings 1</a>
                    </li>
                    <li><a href="#">Settings 2</a>
                    </li>
                  </ul>
                </li>
                <li><a class="close-link"><i class="fa fa-close"></i></a>
                </li>
              </ul>
              <div class="clearfix"></div>
            </div>
            <div class="x_content" style="display: block;">
  
                {2}
           
            </div>
          </div>  
        </div>
            `.format(panel.id,keyword,panelcontent);
    
  },
  renderRow:function(panels){
    const self=this;
    let html = panels.map(function(panel){return `{0}`.format(self.renderPanelTitle(panel));})
    html = html.join("");
    return `<div class="row">{0}</div>`.format(html);
  },
  
}; 