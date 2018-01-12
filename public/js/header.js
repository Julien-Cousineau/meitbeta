/*global $,extend,localStorage*/
function Header(parent,options){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
  this.construct();
}
Header.prototype ={
  get container(){return this.options.container;},
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  options:{container:""
    
  },
  construct:function(){
    if(this.parent.debug)console.log("Constructing Header")
    this.render();
  },
  render:function(){
    $(this.container).append(this.renderhtml);
    $('#header').append(this.getDiv());
    this.postrender();
  },
  postrender:function(){
    const self=this;
    $(".LGbtn2").click(function(e){return self.parent.changeLanguageToggle();});
    $(".btn-logout").click(this.parent.login.logout);
    // this.parent.Login.show_logged_in();
    this.getUserInfo();
    
    const bar = new HeaderHelper("banner")
    const id = '#{0}'.format(bar.id);
    const chevron = '#{0}Chevron'.format(bar.id);
    const chevronI = '#{0}ChevronI i'.format(bar.id);
    $(chevron).on('click',function() {
      bar.active =(bar.active)?false:true;
      $(chevronI).toggleClass('fa-chevron-down fa-chevron-up');
      let value = (bar.active) ? '0px':'-100px';
      document.querySelector("html").style.setProperty("--bannermargin", value);
    });
  },
  getUserInfo:function(){
    const self=this;
    const userInfo = this.parent.login.userInfo;
    if(userInfo){
      $("#usernameHome").text(userInfo.user_metadata.first);
      if(userInfo.app_metadata.roles[0]=="admin" || userInfo.app_metadata.roles[0]=="user"){
          $('#headerdroplist').prepend(`<button class="upload dropdown-item" type="button"  data-toggle="modal" data-target="#exampleModal" keyword="upload"  keywordType="text"><span><i class="fa fa-cloud-upload fa-fw" aria-hidden="true"></i></span>Upload</button>`);
      }
    }
  },
  getDiv:function(){
      return  `<div class = 'linkContainer'>
    <div class = 'gcLogoBox'>
      <img src='//www.nrc-cnrc.gc.ca/_gcwu/theme-gcwu-fegc/images/sig-eng.png'>
    </div>
    <ul class="nav justify-content-end">
      <li class="nav-item">
        <a class="nav-link active LGbtn2" href="#" keyword="language" keywordType="text">Français</a>
      </li>
      
      <div class="btn-group">
        <button type="button" class="headerdrop btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="fa fa-user fa-fw"></i>
            <span id="usernameHome">Username</span><span class="caret"></span>
        </button>
        <div id="headerdroplist" class="dropdown-menu dropdown-menu-right">
          <div class="dropdown-divider"></div>
          <button class="dropdown-item btn-logout" type="button" keyword="logout" keywordType="text"><i class="fa fa-sign-out fa-fw"></i>Log out</button>
        </div>
      </div>
      
    </ul>
  </div>

  <div id="banner">
    <div class ='bannerContainer'>
      <div class ='leaflogo'></div>
      <div class="nrclogo"></div>                     
      <div class="row bannerrow"> 
        <div class="col-sm-6 bannerCC"><div class ='bannerText'>Marine Renewable Energy Atlas</div></div>       
      </div>
    </div>
    <div id="bannerChevron">
      <span id="bannerChevronI""><i class="fa fa-chevron-up" aria-hidden="true"></i></span>
    </div>
  </div>`
  },

};

function HeaderHelper(id){
  this.id = id;
  this.active = true;

}
  