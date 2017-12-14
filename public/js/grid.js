

function Grid(parent){
  this._parent = parent;
  this.construct()

    
}
Grid.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  construct:function(){

    
    $('.gridContainer').empty().append(this.renderRow(this.parent.panels));
    this.panelFunc();
    
    
  },
  panelFunc:function(){
    $(".collapse-link").on("click",function(){
      var a=$(this).closest(".x_panel")
      var b=$(this).find("i")
      var c=a.find(".x_content")
      a.attr("style")?c.slideToggle(200,function(){a.removeAttr("style")}):(c.slideToggle(200),a.css("height","auto"));
      b.toggleClass("fa-chevron-up fa-chevron-down")});
      $(".close-link").click(function(){var a=$(this).closest(".x_panel");a.remove()});
  },
  renderPanelTitle:function(panel){
    return `
          <div class="x_panel tile fixed_height_320" panelid="{0}">
            <div class="x_title">
              <h2>{1}</h2>
              <ul class="nav navbar-right panel_toolbox">
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
              <div class="{2}">
              </div>
            </div>
          </div>  
            `.format(panel.id,panel.header,panel.class);
    
  },
  renderRow:function(panels){
    const self=this;
    let html = panels.map(function(panel){return `<div class="col-xl-3 col-lg-4 col-md-6 col-sm-12">{0}</div>`.format(self.renderPanelTitle(panel));})
    html = html.join("");
    return `<div class="row">{0}</div>`.format(html);
  },
  
}; 