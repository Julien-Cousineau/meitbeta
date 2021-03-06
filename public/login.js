/*global $ extend localStorage location auth0*/


function Login(parent,options){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
 
}
Login.prototype ={
  options:{
      container:"body",
      AUTH0:{
        AUTH0_CLIENT_ID:'QtyNHacFL1GhHcL7z5Ce3j34tPf3gJgB',
        AUTH0_DOMAIN:'nrc-ocre.auth0.com',  
        // AUTH0_AUDIENCE:'https://nrc-ocre.auth0.com/api/v2/',
        AUTH0_CALLBACK_URL:window.location.href,
      },
  },
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get parentcontainer(){return this.parent.container;},
  get container(){return this.options.container;},
  get AUTH0(){return this.options.AUTH0;},
  get userInfo(){
    if(!(this._userInfo)){
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if(!(userInfo)){this.logout();}
      this._userInfo=userInfo;
    }
    return this._userInfo;
  },
  set user(value){this._user=value;},
  get id_token(){if(!(this._id_token)){this._id_token=localStorage.getItem('id_token');};return this._id_token;},
  set id_token(value){this._id_token=value;},
  get access_token(){if(!(this._access_token)){this._access_token=localStorage.getItem('access_token');};return this._access_token;},
  set acess_token(value){this._acess_token=value;},  
  
  get auth(){
    if(!(this._auth)){
     
      this._auth=new auth0.WebAuth({
        domain: this.AUTH0.AUTH0_DOMAIN,
        clientID: this.AUTH0.AUTH0_CLIENT_ID,
        redirectUri: this.AUTH0.AUTH0_CALLBACK_URL,
        // audience: this.AUTH0.AUTH0_AUDIENCE,
        responseType: 'token id_token'
      });
       console.log(this._auth)
    }
    return this._auth;
  },

  construct:function(){
    if(this.parent.debug)console.log("Constructing Login");
    this.render();
    this.constructFunc();
  },
  constructFunc:function(){
    const self=this;
    $("#username").keyup(function(e) {
      if (e.keyCode == 27 || e.keyCode == 13) {
  		self.login();
  	  }
    });
    $("#password").keyup(function(e) {
      if (e.keyCode == 27 || e.keyCode == 13) {
  		self.login();
  	}
    });
  },
  render:function(){
    const self=this;
    
    $(this.container).append(this.renderhtml);
    $("#username").on("blur",this.checkValue);
    $("#password").on("blur",this.checkValue);
    const openFormE=function(){self.parent.changeLanguage('en');self.openForm();};
    const openFormF=function(){self.parent.changeLanguage('fr');self.openForm();};
    
    $("#openFormE").on("click",openFormE);
    $("#openFormF").on("click",openFormF);
    $("#closeForm").on("click",this.closeForm);
    $('#btn-login').on('click', function(){self.login();});
    $('#btn-logout').on('click',function(){self.logout();});
  },
  openForm:function(){$("#mainButton").attr('class', 'mainButton active');},
  closeForm:function(){$("#mainButton").attr('class', 'mainButton');},
  checkValue:function(){this.className = this.value.length > 0 ? 'active':''; },
  login:function() {
    var obj = {connection: 'Username-Password-Authentication',
               username: $('#username').val(),
               password: $('#password').val(),
              };

    this.auth.redirect.loginWithCredentials(obj, function(err) {
      if (err) return alert(err.description);
    });

    
  },
  show_sign_in:function() {
    $(this.parent.container).hide();
    this.construct();
    // $(this.container).show();
    setTimeout(function(){
      $("#password").focus();
      $("#username").focus();
    },2000);
  },
  show_home:function() {
    const self=this;
    console.log('show_home')
    $('#login').hide();
    var script_arr = [
        'css/modal.css', 
        'css/ext/mapbox-gl.css',
        'css/ext/mapbox-gl-geocoder.css',
        'css/ext/bootstrap.min.css',
        'css/fontawesome-all.min.css',
        'css/font-awesome-extension.min.css',
        'css/ext/dropzone.min.css',
        'css/ext/dataTables.bootstrap4.min.css',
        'css/ext/dc.css',
        'css/ext/mapdc.css',
        "js/ext/jquery.dataTables.min.js",
        "js/ext/dataTables.bootstrap4.min.js",
        "js/ext/d3.js",
        "js/ext/async.min.js",
        "js/ext/FileSaver.js",
        "js/ext/xlsx.full.min.js",
        "js/ext/mapd/crossfilter.js",
        "js/ext/mapd/dc.js",
        "js/ext/mapd/browser-connector.js",
        "js/ext/mapd/mapd-crossfilter.js",
        "js/ext/mapd/mapdc.js",
    ];
    // "/socket.io/socket.io.js",
    const accessToken = localStorage.getItem('id_token');
    console.log(localStorage.getItem('access_token'))
    console.log(accessToken)
    // console.log(localStorage.getItem('id_token'))
    $.ajax({
      url: '/token',
      headers: {"Authorization": 'Bearer ' + accessToken},
      success:function(data){
        console.log(data)
        if(data.status){
          window.location.href='/private/index.html'
        } else {
          self.logout();
        }
      },
      error:function(){
        self.logout();
      },
    });
    // $.getMultiScripts(script_arr, '/private/',{headers: {"Authorization": 'Bearer ' + accessToken}}).done(function() {
      
    //   console.log(logoDark)
    //   console.log("Done")
    //     // all scripts loaded
    // });
    // location.href="http://ec-meit-dev.ca/login"
    
    // var accessToken = localStorage.getItem('id_token');
    // console.log(accessToken)
    // window.location.href = "/callback?token={0}".format(accessToken);
    // $.ajax({
    //   url: 'http://ec-meit-dev.ca/callback?token={0}'.format(accessToken),
    //   type: 'GET',
    //   headers: {"Authorization": 'Bearer ' + accessToken},
    //   success: function(data) {
    //     // console.log(data)
    //   }
    // });
    // this.parent.show();
    
    
    // $("#usernameHome").text(this.user.user_metadata.first);
    // if(this.user.app_metadata.roles[0]=="admin"){
    //     $('#headerdroplist').prepend( "<p>Test</p>" );
    // }
  },
  
  parseHash:function() {
    const self = this;
    const token = localStorage.getItem('access_token');
    
    if (token)return self.show_home();
    console.log("here")
    self.auth.parseHash({ _idTokenVerification: false }, function(err, authResult) {
      console.log(err)
     
      if (authResult && authResult.accessToken && authResult.idToken){
        window.location.hash = '';
        self.setSession(authResult);
      } else {
         if(err || (authResult && authResult.error)){alert('error: ' + err);}
         return self.show_sign_in(); 
      }
    });
    
    
    
    
  },
  setSession:function(authResult) {
    const self=this;
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('access_token', authResult.accessToken); 
    // const expiresAt = JSON.stringify(
    //   authResult.expiresIn * 1000 + new Date().getTime()
    // );    
    // localStorage.setItem('expires_at', expiresAt);
    this.getAuth0Info(authResult,function(){
      self.show_home();
    });
    
  },
  logout:function() {
    this.userInfo=null;
    this.id_token=null;
    this.access_token=null;
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('userInfo');
    window.location.href = "/";
  },
  getAuth0Info:function(authResult,callback){
    const self=this;
    self.auth.client.userInfo(authResult.accessToken, function(err, user) {
      if(err || !(user))return self.show_sign_in();
      localStorage.setItem('userInfo', JSON.stringify(user));
      callback();
    });
  },
  get renderhtml(){
    return `
    <div id="login">
      <div class="loginchild">
        <div style="padding: 50px 30px 30px 0px;">
              {0}
        </div>
        <div id="mainButton" class="mainButton">
        	<div class="btn-text" id="openFormE">English</div>
          	<div class="modal">
          		<div class="close-button" id="closeForm">x</div>
          		<div class="input-group">
          			<input type="text" id="username"/>
          			<label id="lusername" for="username">Username</label>
          		</div>
          		<div class="input-group">
          			<input type="password" id="password"/>
          			<label id="lpassword" for="password">Password</label>
          		</div>
          		<div class="form-button" id="btn-login">Sign In!</div>
          	</div>
          </div>
          <div class="mainButton">
            	<div class="btn-text" id="openFormF">Français</div>
            <div class="logo dark"></div>
          </div>
          <div class="container">
            <div class="row" style="padding-top: 20px;">
              <div class="col-sm-6">
                <h6 class="logoTitle">EC - Marine Emission Inventory Tool</h6>
              </div>
              <div class="col-sm-6">
                  <h6 class="logoTitle">EC - Outil d’inventaire des émissions des navires</h6>
              </div>
          	</div>
          	<div class="row" style="padding-top: 40px;">
              <div class="col-sm-7">
                
              </div>
              <div class="col-sm-5">
                {1}
              </div>
          	</div>
          </div>
        </div>
      </div>
          `.format(this.htmlFlag(),this.htmlLogo());
  },
  htmlFlag:function(){
    return `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%" viewBox="0 0 213 20" preserveAspectRatio="xMinYMin meet">
    	<defs>
    		<style type="text/css">
    			.fip_text {fill:#000;}.fip_flag {fill:#F00;}
    		</style>
    	</defs>
    	<g id="sig" transform="translate(-2,-2)">
    		<path class="fip_flag" d="M 41.5,21.8 H 31.6 V 2.2 h 9.9 v 19.6 l 0,0 z M 21.8,3.7 c 0,0 -1.2,2.4 -1.4,2.6 -0.2,0.3 -0.3,0.3 -0.6,0.2 -0.3,-0.2 -1.3,-0.7 -1.3,-0.7 0,0 0.9,3.9 0.9,4.2 0.1,0.3 -0.2,0.6 -0.6,0.3 -0.1,-0.1 -1.8,-2 -1.8,-2 0,0 -0.4,0.9 -0.5,1.1 -0.1,0.2 -0.2,0.3 -0.4,0.2 -0.3,-0.1 -1.9,-0.4 -1.9,-0.4 0,0 0.6,1.9 0.7,2.2 0.1,0.2 0.2,0.4 -0.2,0.6 l -0.6,0.2 c 0,0 3.3,2.9 3.4,3 0.2,0.2 0.3,0.2 0.2,0.7 -0.2,0.5 -0.3,1.1 -0.3,1.1 0,0 3.1,-0.7 3.4,-0.7 0.3,0 0.6,0.1 0.6,0.4 0,0.3 -0.2,3.7 -0.2,3.7 h 1 c 0,0 -0.2,-3.3 -0.2,-3.7 0,-0.3 0.3,-0.4 0.6,-0.4 0.3,0.1 3.4,0.7 3.4,0.7 0,0 -0.2,-0.7 -0.3,-1.1 -0.2,-0.5 0,-0.6 0.2,-0.7 0.1,-0.1 3.4,-3 3.4,-3 L 28.7,12 c -0.3,-0.2 -0.2,-0.4 -0.2,-0.6 0.1,-0.2 0.7,-2.2 0.7,-2.2 0,0 -1.6,0.3 -1.9,0.4 C 27.1,9.7 27,9.5 26.9,9.4 26.8,9.2 26.4,8.3 26.4,8.3 c 0,0 -1.7,2 -1.8,2 -0.3,0.2 -0.7,0 -0.6,-0.3 0,-0.3 0.9,-4.2 0.9,-4.2 0,0 -1,0.6 -1.3,0.7 C 23.4,6.7 23.2,6.7 23,6.3 23,6 21.8,3.7 21.8,3.7 l 0,0 z M 11.9,21.8 V 2.2 H 2 v 19.6 h 9.9 l 0,0 z"></path>
    		<path class="fip_text" d="M 66,10.2 H 65.1 L 64.9,9.3 c -0.8,0.9 -1.4,1.1 -2.4,1.1 -2.4,0 -3.8,-1.9 -3.8,-4.2 C 58.6,3.9 60,2 62.4,2 c 1.8,0 3.2,0.9 3.4,2.7 H 64.4 C 64.3,3.6 63.3,3.1 62.3,3.1 c -1.7,0 -2.4,1.5 -2.4,3.1 0,1.5 0.7,3.1 2.4,3.1 1.4,0 2.2,-0.8 2.3,-2.2 H 62.5 V 6 H 66 v 4.2 z m 1.1,-2.9 c 0,-1.8 1.1,-3.1 2.9,-3.1 1.8,0 2.9,1.3 2.9,3.1 0,1.8 -1.1,3.1 -2.9,3.1 -1.8,0 -2.9,-1.3 -2.9,-3.1 z m 4.5,0 c 0,-1 -0.5,-2 -1.7,-2 -1.2,0 -1.7,1 -1.7,2 0,1 0.5,2.1 1.7,2.1 1.2,0 1.7,-1.1 1.7,-2.1 z m 1.8,-2.9 h 1.4 l 1.5,4.5 0,0 1.4,-4.5 H 79 l -2,5.8 H 75.6 L 73.4,4.4 z m 7.4,3.2 c 0,0.9 0.5,1.7 1.6,1.7 0.7,0 1.2,-0.3 1.4,-1 H 85 c -0.3,1.3 -1.4,2 -2.6,2 -1.8,0 -2.8,-1.3 -2.8,-3.1 0,-1.7 1.1,-3.1 2.8,-3.1 1.8,0 3,1.7 2.7,3.4 h -4.3 v 0.1 z m 3,-0.8 C 83.8,6 83.2,5.3 82.3,5.3 81.4,5.3 80.8,6 80.8,6.8 h 3 z m 2.3,-2.4 h 1.2 v 1.1 l 0,0 c 0.1,-0.6 0.9,-1.3 1.7,-1.3 0.3,0 0.4,0 0.5,0 v 1.2 c -0.2,0 -0.4,-0.1 -0.6,-0.1 -0.9,0 -1.6,0.7 -1.6,2 v 2.8 H 86 V 4.4 h 0.1 z m 4.2,0 h 1.2 v 0.9 l 0,0 c 0.4,-0.6 1,-1 1.8,-1 1.3,0 2.1,0.7 2.1,2 v 4 H 94.1 V 6.6 C 94.1,5.7 93.7,5.3 93,5.3 92.1,5.3 91.6,6 91.6,6.8 v 3.4 H 90.3 V 4.4 z m 6.4,0 h 1.2 v 0.8 l 0,0 c 0.4,-0.6 0.9,-1 1.8,-1 0.7,0 1.4,0.3 1.6,1 0.4,-0.6 1,-1 1.8,-1 1.2,0 1.9,0.5 1.9,2 v 4 h -1.3 V 6.8 c 0,-0.9 -0.1,-1.6 -1.1,-1.6 -0.9,0 -1.2,0.6 -1.2,1.6 v 3.4 h -1.3 V 6.5 c 0,-0.8 -0.2,-1.2 -1,-1.2 -0.7,0 -1.3,0.5 -1.3,1.5 v 3.5 H 96.5 V 4.4 h 0.2 z m 10.8,3.2 c 0,0.9 0.5,1.7 1.6,1.7 0.7,0 1.2,-0.3 1.4,-1 h 1.2 c -0.3,1.3 -1.4,2 -2.6,2 -1.8,0 -2.8,-1.3 -2.8,-3.1 0,-1.7 1.1,-3.1 2.8,-3.1 1.8,0 3,1.7 2.7,3.4 h -4.3 v 0.1 z m 3,-0.8 c 0,-0.8 -0.6,-1.5 -1.5,-1.5 -0.9,0 -1.5,0.7 -1.5,1.5 h 3 z m 2.3,-2.4 h 1.2 v 0.9 l 0,0 c 0.4,-0.6 1,-1 1.8,-1 1.3,0 2.1,0.7 2.1,2 v 4 h -1.3 V 6.6 c 0,-0.9 -0.4,-1.3 -1.1,-1.3 -0.9,0 -1.4,0.7 -1.4,1.5 v 3.4 h -1.3 V 4.4 z m 5.9,0 h 1 V 2.7 h 1.3 v 1.7 h 1.2 v 1 H 121 v 3.1 c 0,0.5 0,0.8 0.6,0.8 0.2,0 0.4,0 0.5,0 v 1 c -0.3,0 -0.6,0.1 -0.8,0.1 -1.3,0 -1.6,-0.5 -1.6,-1.5 V 5.4 h -1 v -1 z M 58.5,18.9 c 0,-1.8 1.1,-3.1 2.9,-3.1 1.9,0 2.9,1.3 2.9,3.1 0,1.8 -1.1,3.1 -2.9,3.1 -1.8,0 -2.9,-1.3 -2.9,-3.1 z m 4.6,0 c 0,-1 -0.5,-2 -1.7,-2 -1.1,0 -1.7,1 -1.7,2 0,1 0.5,2.1 1.7,2.1 1.2,0 1.7,-1.1 1.7,-2.1 z M 64.9,16 h 1 v -0.5 c 0,-1.5 0.8,-1.7 1.6,-1.7 0.4,0 0.7,0 0.9,0.1 v 1 c -0.2,0 -0.3,-0.1 -0.6,-0.1 -0.3,0 -0.6,0.1 -0.6,0.6 V 16 h 1.1 v 1 h -1.1 v 4.9 H 65.9 V 17 h -1 v -1 z m 12.8,0.3 c -0.2,-0.9 -0.8,-1.6 -2,-1.6 -1.7,0 -2.4,1.5 -2.4,3.1 0,1.5 0.7,3.1 2.4,3.1 1.2,0 1.9,-0.9 2,-2.1 h 1.4 C 79,20.7 77.7,22 75.7,22 c -2.4,0 -3.8,-1.9 -3.8,-4.2 0,-2.3 1.4,-4.2 3.8,-4.2 1.8,0 3.2,1 3.4,2.7 h -1.4 z m 7.4,4.2 c 0,0.3 0.1,0.4 0.3,0.4 0.1,0 0.2,0 0.3,0 v 0.9 c -0.2,0.1 -0.6,0.1 -0.8,0.1 -0.5,0 -0.9,-0.2 -1,-0.7 -0.5,0.5 -1.3,0.7 -2,0.7 -1,0 -2,-0.6 -2,-1.7 0,-1.5 1.2,-1.7 2.2,-1.8 0.9,-0.2 1.7,-0.1 1.7,-0.8 0,-0.7 -0.7,-0.8 -1.2,-0.8 -0.7,0 -1.2,0.3 -1.3,0.9 H 80 c 0.1,-1.5 1.4,-1.9 2.6,-1.9 1.1,0 2.3,0.5 2.3,1.7 v 3 h 0.2 z m -1.2,-1.6 c -0.4,0.3 -1,0.2 -1.6,0.3 -0.6,0.1 -1,0.3 -1,1 0,0.6 0.7,0.7 1.2,0.7 0.6,0 1.4,-0.3 1.4,-1.1 V 18.9 z M 86.5,16 h 1.2 v 0.9 l 0,0 c 0.4,-0.6 1,-1 1.8,-1 1.3,0 2.1,0.7 2.1,2 v 4 h -1.3 v -3.7 c 0,-0.9 -0.4,-1.3 -1.1,-1.3 -0.9,0 -1.4,0.7 -1.4,1.5 v 3.4 H 86.5 V 16 z m 11.2,4.5 c 0,0.3 0.1,0.4 0.3,0.4 0.1,0 0.2,0 0.3,0 v 0.9 c -0.2,0.1 -0.6,0.1 -0.8,0.1 -0.5,0 -0.9,-0.2 -1,-0.7 -0.5,0.5 -1.3,0.7 -2,0.7 -1,0 -2,-0.6 -2,-1.7 0,-1.5 1.2,-1.7 2.2,-1.8 0.9,-0.2 1.7,-0.1 1.7,-0.8 0,-0.7 -0.7,-0.8 -1.2,-0.8 -0.7,0 -1.2,0.3 -1.3,0.9 h -1.3 c 0.1,-1.5 1.4,-1.9 2.6,-1.9 1.1,0 2.3,0.5 2.3,1.7 v 3 h 0.2 z m -1.3,-1.6 c -0.4,0.3 -1,0.2 -1.6,0.3 -0.6,0.1 -1,0.3 -1,1 0,0.6 0.7,0.7 1.2,0.7 0.6,0 1.4,-0.3 1.4,-1.1 v -0.9 z m 8.1,2.9 h -1.2 V 21 l 0,0 c -0.3,0.7 -1.1,0.9 -1.8,0.9 -1.8,0 -2.7,-1.4 -2.7,-3.1 0,-2.1 1.3,-3 2.5,-3 0.7,0 1.5,0.3 1.9,0.9 l 0,0 v -3 h 1.3 v 8.1 z M 101.7,21 c 1.1,0 1.6,-1 1.6,-2.1 0,-1.3 -0.6,-2 -1.6,-2 -1.2,0 -1.6,1.1 -1.6,2.1 0,1 0.5,2 1.6,2 z m 9.1,-0.5 c 0,0.3 0.1,0.4 0.3,0.4 0.1,0 0.2,0 0.3,0 v 0.9 c -0.2,0.1 -0.6,0.1 -0.8,0.1 -0.5,0 -0.9,-0.2 -1,-0.7 -0.5,0.5 -1.3,0.7 -2,0.7 -1,0 -2,-0.6 -2,-1.7 0,-1.5 1.2,-1.7 2.2,-1.8 0.9,-0.2 1.7,-0.1 1.7,-0.8 0,-0.7 -0.7,-0.8 -1.2,-0.8 -0.7,0 -1.2,0.3 -1.3,0.9 h -1.3 c 0.1,-1.5 1.4,-1.9 2.6,-1.9 1.1,0 2.3,0.5 2.3,1.7 v 3 h 0.2 z m -1.3,-1.6 c -0.4,0.3 -1,0.2 -1.6,0.3 -0.6,0.1 -1,0.3 -1,1 0,0.6 0.7,0.7 1.2,0.7 0.6,0 1.4,-0.3 1.4,-1.1 v -0.9 z m 37.4,-8.7 H 146 l -0.2,-0.9 c -0.8,0.9 -1.4,1.1 -2.4,1.1 -2.4,0 -3.8,-1.9 -3.8,-4.2 0,-2.3 1.4,-4.2 3.8,-4.2 1.8,0 3.2,0.9 3.4,2.7 h -1.4 c -0.1,-1.1 -1.1,-1.6 -2.1,-1.6 -1.7,0 -2.4,1.5 -2.4,3.1 0,1.5 0.7,3.1 2.4,3.1 1.4,0 2.2,-0.8 2.3,-2.2 h -2.1 V 6 h 3.4 v 4.2 z m 1.2,-2.9 c 0,-1.8 1.1,-3.1 2.9,-3.1 1.8,0 2.9,1.3 2.9,3.1 0,1.8 -1.1,3.1 -2.9,3.1 -1.8,0 -2.9,-1.3 -2.9,-3.1 z m 4.5,0 c 0,-1 -0.5,-2 -1.7,-2 -1.1,0 -1.7,1 -1.7,2 0,1 0.5,2.1 1.7,2.1 1.2,0 1.7,-1.1 1.7,-2.1 z m 7.5,2.9 h -1.3 V 9.4 l 0,0 c -0.3,0.6 -1,1 -1.7,1 -1.5,0 -2.2,-0.8 -2.2,-2.3 V 4.4 h 1.3 V 8 c 0,1 0.4,1.4 1.1,1.4 1.1,0 1.4,-0.7 1.4,-1.6 V 4.4 h 1.3 l 0.1,5.8 0,0 z m 0.8,-5.8 h 1.4 l 1.5,4.5 0,0 1.4,-4.5 h 1.3 l -2.1,5.8 H 163 l -2.1,-5.8 z m 7.2,3.2 c 0,0.9 0.5,1.7 1.6,1.7 0.7,0 1.2,-0.3 1.4,-1 h 1.2 c -0.3,1.3 -1.4,2 -2.6,2 -1.8,0 -2.8,-1.3 -2.8,-3.1 0,-1.7 1.1,-3.1 2.8,-3.1 1.8,0 3,1.7 2.7,3.4 h -4.3 v 0.1 z m 3,-0.8 c 0,-0.8 -0.6,-1.5 -1.5,-1.5 -0.9,0 -1.5,0.7 -1.5,1.5 h 3 z m 2.3,-2.4 h 1.2 v 1.1 l 0,0 c 0.1,-0.6 0.9,-1.3 1.7,-1.3 0.3,0 0.4,0 0.5,0 v 1.2 c -0.2,0 -0.4,-0.1 -0.6,-0.1 -0.9,0 -1.6,0.7 -1.6,2 v 2.8 h -1.3 l 0.1,-5.7 0,0 z m 4,0 h 1.2 v 0.9 l 0,0 c 0.4,-0.6 1,-1 1.8,-1 1.3,0 2.1,0.7 2.1,2 v 4 h -1.3 V 6.6 c 0,-0.9 -0.4,-1.3 -1.1,-1.3 -0.9,0 -1.4,0.7 -1.4,1.5 v 3.4 h -1.3 V 4.4 z m 7.5,3.2 c 0,0.9 0.5,1.7 1.6,1.7 0.7,0 1.2,-0.3 1.4,-1 h 1.2 c -0.3,1.3 -1.4,2 -2.6,2 -1.8,0 -2.8,-1.3 -2.8,-3.1 0,-1.7 1.1,-3.1 2.8,-3.1 1.8,0 3,1.7 2.7,3.4 h -4.3 v 0.1 z m 3,-0.8 c 0,-0.8 -0.6,-1.5 -1.5,-1.5 -0.9,0 -1.5,0.7 -1.5,1.5 h 3 z m 2.2,-2.4 h 1.2 v 0.8 l 0,0 c 0.4,-0.6 0.9,-1 1.8,-1 0.7,0 1.4,0.3 1.6,1 0.4,-0.6 1,-1 1.8,-1 1.2,0 1.9,0.5 1.9,2 v 4 h -1.3 V 6.8 c 0,-0.9 -0.1,-1.6 -1.1,-1.6 -0.9,0 -1.2,0.6 -1.2,1.6 v 3.4 h -1.3 V 6.5 c 0,-0.8 -0.2,-1.2 -1,-1.2 -0.7,0 -1.3,0.5 -1.3,1.5 v 3.5 h -1.3 V 4.4 h 0.2 z m 10.8,3.2 c 0,0.9 0.5,1.7 1.6,1.7 0.7,0 1.2,-0.3 1.4,-1 h 1.2 c -0.3,1.3 -1.4,2 -2.6,2 -1.8,0 -2.8,-1.3 -2.8,-3.1 0,-1.7 1.1,-3.1 2.8,-3.1 1.8,0 3,1.7 2.7,3.4 h -4.3 v 0.1 z m 3,-0.8 c 0,-0.8 -0.6,-1.5 -1.5,-1.5 -0.9,0 -1.5,0.7 -1.5,1.5 h 3 z m 2.3,-2.4 h 1.2 v 0.9 l 0,0 c 0.4,-0.6 1,-1 1.8,-1 1.3,0 2.1,0.7 2.1,2 v 4 H 210 V 6.6 c 0,-0.9 -0.4,-1.3 -1.1,-1.3 -0.9,0 -1.4,0.7 -1.4,1.5 v 3.4 h -1.3 V 4.4 z m 5.8,0 h 1 V 2.7 h 1.3 v 1.7 h 1.2 v 1 h -1.2 v 3.1 c 0,0.5 0,0.8 0.6,0.8 0.2,0 0.4,0 0.5,0 v 1 c -0.3,0 -0.6,0.1 -0.8,0.1 -1.3,0 -1.6,-0.5 -1.6,-1.5 V 5.4 h -1 v -1 z M 145.2,21.8 H 144 V 21 l 0,0 c -0.3,0.7 -1.1,0.9 -1.8,0.9 -1.8,0 -2.7,-1.4 -2.7,-3.1 0,-2.1 1.2,-3 2.5,-3 0.7,0 1.5,0.3 1.9,0.9 l 0,0 v -3 h 1.3 v 8.1 z M 142.3,21 c 1.1,0 1.6,-1 1.6,-2.1 0,-1.3 -0.6,-2 -1.6,-2 -1.2,0 -1.6,1.1 -1.6,2.1 0,1 0.5,2 1.6,2 z m 9.4,0.8 h -1.3 V 21 l 0,0 c -0.3,0.6 -1,1 -1.7,1 -1.5,0 -2.2,-0.8 -2.2,-2.3 V 16 h 1.3 v 3.6 c 0,1 0.4,1.4 1.1,1.4 1.1,0 1.4,-0.7 1.4,-1.6 V 16 h 1.3 v 5.8 h 0.1 z m 10.1,-5.5 c -0.2,-0.9 -0.8,-1.6 -2,-1.6 -1.7,0 -2.4,1.5 -2.4,3.1 0,1.5 0.7,3.1 2.4,3.1 1.3,0 1.9,-0.9 2,-2.1 h 1.4 c -0.1,1.9 -1.5,3.3 -3.4,3.3 -2.4,0 -3.8,-1.9 -3.8,-4.2 0,-2.3 1.4,-4.2 3.8,-4.2 1.8,0 3.2,1 3.4,2.7 h -1.4 v -0.1 z m 7.3,4.2 c 0,0.3 0.1,0.4 0.3,0.4 0.1,0 0.2,0 0.3,0 v 0.9 c -0.2,0.1 -0.6,0.1 -0.8,0.1 -0.5,0 -0.9,-0.2 -1,-0.7 -0.5,0.5 -1.3,0.7 -2,0.7 -1,0 -2,-0.6 -2,-1.7 0,-1.5 1.2,-1.7 2.2,-1.8 0.9,-0.2 1.7,-0.1 1.7,-0.8 0,-0.7 -0.7,-0.8 -1.2,-0.8 -0.7,0 -1.2,0.3 -1.3,0.9 H 164 c 0.1,-1.5 1.4,-1.9 2.6,-1.9 1.1,0 2.3,0.5 2.3,1.7 v 3 h 0.2 z m -1.3,-1.6 c -0.4,0.3 -1,0.2 -1.6,0.3 -0.6,0.1 -1,0.3 -1,1 0,0.6 0.7,0.7 1.2,0.7 0.6,0 1.4,-0.3 1.4,-1.1 v -0.9 l 0,0 z m 2.8,-2.9 h 1.2 v 0.9 l 0,0 c 0.4,-0.6 1,-1 1.8,-1 1.3,0 2.1,0.7 2.1,2 v 4 h -1.3 v -3.7 c 0,-0.9 -0.4,-1.3 -1.1,-1.3 -0.9,0 -1.4,0.7 -1.4,1.5 v 3.4 h -1.3 V 16 z m 11.1,4.5 c 0,0.3 0.1,0.4 0.3,0.4 0.1,0 0.2,0 0.3,0 v 0.9 c -0.2,0.1 -0.6,0.1 -0.8,0.1 -0.5,0 -0.9,-0.2 -1,-0.7 -0.5,0.5 -1.3,0.7 -2,0.7 -1,0 -2,-0.6 -2,-1.7 0,-1.5 1.2,-1.7 2.2,-1.8 0.9,-0.2 1.7,-0.1 1.7,-0.8 0,-0.7 -0.7,-0.8 -1.2,-0.8 -0.7,0 -1.2,0.3 -1.3,0.9 h -1.3 c 0.1,-1.5 1.4,-1.9 2.6,-1.9 1.1,0 2.3,0.5 2.3,1.7 v 3 h 0.2 z m -1.3,-1.6 c -0.4,0.3 -1,0.2 -1.6,0.3 -0.6,0.1 -1,0.3 -1,1 0,0.6 0.7,0.7 1.2,0.7 0.6,0 1.4,-0.3 1.4,-1.1 v -0.9 l 0,0 z m 8.2,2.9 h -1.2 V 21 l 0,0 c -0.3,0.7 -1.1,0.9 -1.8,0.9 -1.8,0 -2.7,-1.4 -2.7,-3.1 0,-2.1 1.3,-3 2.5,-3 0.7,0 1.5,0.3 1.9,0.9 l 0,0 v -3 h 1.3 v 8.1 z M 185.7,21 c 1.1,0 1.6,-1 1.6,-2.1 0,-1.3 -0.6,-2 -1.6,-2 -1.2,0 -1.6,1.1 -1.6,2.1 0,1 0.5,2 1.6,2 z m 9.1,-0.5 c 0,0.3 0.1,0.4 0.3,0.4 0.1,0 0.2,0 0.3,0 v 0.9 c -0.2,0.1 -0.6,0.1 -0.8,0.1 -0.5,0 -0.9,-0.2 -1,-0.7 -0.5,0.5 -1.3,0.7 -2,0.7 -1,0 -2,-0.6 -2,-1.7 0,-1.5 1.2,-1.7 2.2,-1.8 0.9,-0.2 1.7,-0.1 1.7,-0.8 0,-0.7 -0.7,-0.8 -1.2,-0.8 -0.7,0 -1.2,0.3 -1.3,0.9 h -1.3 c 0.1,-1.5 1.4,-1.9 2.6,-1.9 1.1,0 2.3,0.5 2.3,1.7 v 3 h 0.2 z m -1.3,-1.6 c -0.4,0.3 -1,0.2 -1.6,0.3 -0.6,0.1 -1,0.3 -1,1 0,0.6 0.7,0.7 1.2,0.7 0.6,0 1.4,-0.3 1.4,-1.1 v -0.9 l 0,0 z"></path>
    	</g>
    </svg>`;
  },
  htmlLogo:function(){
    return `
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%" viewBox="0 0 143 34" preserveAspectRatio="xMinYMin meet">
      	<defs>
      		<style type="text/css">
      			.fip_text {fill:#000;}.fip_flag {fill:#F00;}
      		</style>
      	</defs>
      	<g id="wmms" transform="translate(-1, -1)">
      		<path class="fip_flag" d="M137.9,1.2h5.2v10.4h-5.2V1.2z M128.9,6.4l-0.3,0.1c0,0,1.8,1.5,1.8,1.6c0.1,0.1,0.2,0.1,0.1,0.4 c-0.1,0.3-0.2,0.6-0.2,0.6s1.6-0.3,1.8-0.4c0.2,0,0.3,0,0.3,0.2c0,0.2-0.1,1.9-0.1,1.9h0.5c0,0-0.1-1.8-0.1-1.9 c0-0.2,0.1-0.2,0.3-0.2c0.2,0,1.8,0.4,1.8,0.4s-0.1-0.4-0.2-0.6c-0.1-0.3,0-0.3,0.1-0.4c0.1-0.1,1.8-1.6,1.8-1.6l-0.3-0.1 c-0.2-0.1-0.1-0.2-0.1-0.3s0.3-1.1,0.3-1.1s-0.8,0.2-0.9,0.2c-0.1,0-0.2,0-0.2-0.1s-0.2-0.5-0.2-0.5s-0.9,1-1,1.1 c-0.2,0.2-0.4,0-0.3-0.2c0-0.2,0.5-2.3,0.5-2.3s-0.5,0.3-0.7,0.4s-0.3,0.1-0.3-0.1c-0.1-0.2-0.7-1.3-0.7-1.4c0,0-0.6,1.2-0.7,1.4 s-0.2,0.2-0.3,0.1c-0.2-0.1-0.7-0.4-0.7-0.4s0.5,2.1,0.5,2.3s-0.1,0.3-0.3,0.2l-1-1.1c0,0-0.1,0.3-0.2,0.4c0,0.1-0.1,0.2-0.2,0.1 c-0.2,0-1-0.2-1-0.2s0.3,1,0.4,1.1C129.1,6.1,129.1,6.3,128.9,6.4z M122.2,1.2h5.2v10.4h-5.2V1.2z"></path>
      		<path class="fip_text" d="M144.2,32.4c-0.4,0.9-1.2,1.2-1.7,1.2c-0.6,0-2.4-0.1-2.4-4.8c0,0,0-9.5,0-10.1c0-3.1-2.4-5.6-8.6-5.6 c-6.7,0-6.8,3.3-6.8,4.1c-0.1,0.9,0.4,1.9,2.1,1.9c1.5,0,1.9-1.7,2.1-2.3c0.2-0.7,0.3-2.7,3-2.7c2.3,0,3.7,2,3.8,4.9 c0,0.5,0,0.8,0,1.1c0,0.2,0,0.3,0,0.5l0,0l0,0v0.1c-0.2,1-0.7,1.5-1.6,1.9c-1.2,0.6-4.7,1.1-5.1,1.2c-1.4,0.3-5.3,1.3-5.2,5.4 c0.1,4,4.1,5.4,6.9,5.3c2.7-0.1,4.3-1.2,5-1.8c0.4-0.3,0.4-0.3,0.7,0.1c0.4,0.4,1.7,1.7,4.8,1.7c3.2,0,3.6-1.5,3.8-2 C145.1,32.2,144.4,31.9,144.2,32.4z M131.7,33.5c-2.8,0-3.5-2.3-3.5-3.5c0-1.1,0.6-3.4,3.4-5c0,0,1.3-0.8,3.8-1.8 c0.1,0,0.2,0,0.2,0s0.1,0.1,0.1,0.2l0,0l0,0v0.1l0,0l0,0v0.1l0,0l0,0l0,0v4.2C135.7,31.1,134.1,33.5,131.7,33.5z M122.5,33.4 c-0.4-0.1-2.9,0.2-2.9-7.4s0-23.9,0-23.9c0-0.3,0-1.1-0.9-1.1c-0.9,0-6.9,0.3-7.3,0.4c-0.4,0-0.7,0.5,0,0.5 c0.7,0.1,3.9,0.3,3.9,5.6c0,2.6,0,5.2,0,7.1c0,0.1,0,0.2,0,0.2c0,0.2,0,0.3-0.1,0.4c0,0,0,0,0,0.1l0,0c-0.1,0.1-0.2,0-0.5-0.2 c-0.5-0.4-2.8-1.8-5.7-1.8c-4.7,0-10.5,3.4-10.5,10.4c0,7.5,5.3,11.1,10.8,11.1c2.7,0,4.6-1.2,5.3-1.6c0.8-0.5,0.7-0.4,0.8,0.3 c0.1,0.5,0,1.5,1.4,1.4c1.5-0.2,5.1-0.6,5.8-0.7C123.3,33.9,123.1,33.5,122.5,33.4z M110.1,33.7c-4.4,0-6.7-5.2-6.7-10.2 c0-5.5,3.1-9.2,6.4-9c4.3,0.3,5.4,3.7,5.5,9.8c0,0.4,0,0.8,0,1.3C115.2,31.6,112.7,33.7,110.1,33.7z M98.4,32.4 c-0.4,0.9-1.2,1.2-1.7,1.2c-0.6,0-2.4-0.1-2.4-4.8c0,0,0-9.5,0-10.1c0-3.1-2.4-5.6-8.6-5.6c-6.7,0-6.8,3.3-6.8,4.1 c-0.1,0.9,0.4,1.9,2.1,1.9c1.5,0,1.9-1.7,2.1-2.3c0.2-0.7,0.3-2.7,3-2.7c2.3,0,3.8,2,3.8,5v0.1c0,0.1,0,0.2,0,0.2v0.3 c0,0.1,0,0.3,0,0.4c-0.1,1.5-0.5,2-1.7,2.6c-1.2,0.6-4.7,1.1-5.1,1.2c-1.4,0.3-5.3,1.3-5.2,5.4c0.1,4,4.1,5.4,6.9,5.3 c2.7-0.1,4.3-1.2,5-1.8c0.4-0.3,0.4-0.3,0.7,0.1c0.4,0.4,1.7,1.7,4.8,1.7c3.2,0,3.6-1.5,3.8-2C99.3,32.2,98.7,31.9,98.4,32.4z  M86,33.5c-2.8,0-3.5-2.3-3.5-3.5c0-1.1,0.6-3.4,3.4-5c0,0,1.3-0.8,3.8-1.8c0.1,0,0.2,0,0.2,0v0.1l0,0l0,0c0,0.1,0,0.2,0,0.4v-0.1 c0,0,0,0,0,0.1v4.2C89.9,31.1,88.3,33.5,86,33.5z M76.4,33.4c-0.8-0.2-2.2-1.1-2.2-5.5v-8c0-1.9,0.2-6.8-7.3-6.8 c-3.9,0-6.1,2-6.3,2.1c-0.3,0.3-0.5,0.4-0.6-0.1c-0.1-0.4-0.3-1-0.4-1.4c-0.1-0.3-0.3-0.6-1-0.5c-0.7,0.1-5.1,0.8-5.9,1 c-0.7,0.2-0.5,0.5,0,0.6c0.5,0.1,2.9,0.3,2.9,4.4s0,8.6,0,8.6c0,5-1,5.4-1.9,5.7c-1.2,0.3-0.6,0.7-0.1,0.7c0,0,8.9,0,9.1,0 c0.6,0,0.9-0.6-0.3-0.8c-1.2-0.2-2.3-0.9-2.3-4.8c0-0.4,0-4.7,0-5.5c0-2.1-0.5-8.5,5.3-8.6c4.1-0.1,4.5,3.3,4.5,5.5v8.5 c0,3.5-1,4.6-2.2,4.8c-1.1,0.2-0.9,0.7-0.3,0.7c0.2,0,9.3,0,9.3,0C77.2,34.2,77.7,33.7,76.4,33.4z M52.1,32.4 c-0.4,0.9-1.2,1.2-1.7,1.2c-0.6,0-2.4-0.1-2.4-4.8c0,0,0-9.5,0-10.1c0-3.1-2.4-5.6-8.6-5.6c-6.7,0-6.8,3.3-6.8,4.1 c-0.1,0.9,0.4,1.9,2.1,1.9c1.5,0,1.9-1.7,2.1-2.3c0.2-0.7,0.3-2.7,3-2.7c2.3,0,3.7,2,3.8,4.9c0,0.5,0,0.8,0,1.1 c0,0.2,0,0.4-0.1,0.5v0.1l0,0c-0.2,1-0.7,1.5-1.6,1.9c-1.2,0.6-4.7,1.1-5.1,1.2c-1.4,0.3-5.3,1.3-5.2,5.4c0.1,4,4.1,5.4,6.9,5.3 c2.7-0.1,4.3-1.2,5-1.8c0.4-0.3,0.4-0.3,0.7,0.1c0.4,0.4,1.7,1.7,4.8,1.7c3.2,0,3.6-1.5,3.8-2C53,32.2,52.3,31.9,52.1,32.4z  M39.6,33.5c-2.8,0-3.5-2.3-3.5-3.5s0.6-3.4,3.4-5c0,0,1.3-0.8,3.8-1.8c0.1,0,0.2,0,0.2,0s0.1,0.1,0.1,0.2l0,0l0,0l0,0 c0,0,0,0.1,0,0.2l0,0l0,0v0.1l0,0l0,0l0,0v4.2C43.6,31.1,42,33.5,39.6,33.5z M30,24.8c-1,3.2-2.9,8.4-9.8,8.6 C13,33.5,8.7,28.6,8.5,19.5C8.2,9.8,12.4,2.4,18.9,2.2c7.3-0.1,9.9,8.6,10,9.9c0.1,1,1.4,0.9,1.4-0.1c0-0.5-0.6-9.1-0.8-10.1 c-0.2-1-1-0.6-1.2-0.2C28.2,2,28.4,1.4,28,2.3c-0.4,0.9-1.5,0.4-1.9,0.3c-1.2-0.5-3.5-1.7-7.2-1.6c-8.5,0.2-17.2,6.5-17,17.5 c0.2,10.7,8.8,16.7,16.8,16.6c7.3-0.1,11.4-4.7,12.6-10C31.7,23.8,30.4,23.5,30,24.8z"></path>
      	</g>
      </svg>`;
  },
  
};