/*global $,extend,localStorage*/
function Footer(parent,options){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
  this.construct();
}
Footer.prototype ={
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  options:{container:""
    
  },
  construct:function(){
    if(this.parent.debug)console.log("Constructing Header")
    this.render();
  },
  render:function(){
    $('.sidebar.footer').append(this.divSideBarIcons());
    $('[data-toggle="tooltip"]').tooltip();
    // $(".LGbtn2").click(this.changeLanguage);
    // this.postrender();
  },
  
  divSideBarIcons:function(){
    const charts =this.parent.charts;
    const keywords = this.parent.keywords;
    
    let icons= charts.map(function(chart) {
      return '<li class="sidernav-list-item" data-toggle="tooltip" data-placement="right" title="{0}"><i class="{1}"></i></li>'.format(keywords[chart.keyword].en,chart.icon);
    });
    return '<ul class="sidernav-list">{0}</ul>'.format(icons.join(""));
  },
  
  
}