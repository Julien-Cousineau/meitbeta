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
    this.changeLanguage = this.parent.changeLanguageToggle;
    
    this.render();
  },
  render:function(){
    $(this.container).append(this.renderhtml);
    $('#header').append(this.getDiv());
    this.postrender();
  },
  postrender:function(){
    $(".LGbtn2").click(this.changeLanguage);
    $(".btn-logout").click(this.parent.Login.logout);
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
    var user = JSON.parse(localStorage.getItem('userInfo'));
    
    $("#usernameHome").text(user.user_metadata.first);
    if(user.app_metadata.roles[0]=="admin"){
        $('#headerdroplist').prepend(`<button class="upload dropdown-item" type="button"  data-toggle="modal" data-target="#exampleModal"><span><i class="fa fa-cloud-upload fa-fw" aria-hidden="true"></i></span>Upload</button>`);
        $(".upload").click(function(){self.parent.upload()});
    }
  },
  getDiv:function(){
      return  `<div class = 'linkContainer'>
    <div class = 'gcLogoBox'>
      <img src='//www.nrc-cnrc.gc.ca/_gcwu/theme-gcwu-fegc/images/sig-eng.png'>
    </div>
    <ul class="nav justify-content-end">
      <li class="nav-item">
        <a class="nav-link active LGbtn2" href="#">Français</a>
      </li>
      
        <div class="btn-group">
      <button type="button" class="headerdrop btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <i class="fa fa-user fa-fw"></i>
          <span id="usernameHome">Username</span><span class="caret"></span>
      </button>
      <div id="headerdroplist" class="dropdown-menu dropdown-menu-right">
        <div class="dropdown-divider"></div>
        <button class="dropdown-item btn-logout" type="button"><i class="fa fa-sign-out fa-fw"></i><span>Log out</span></button>
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
  