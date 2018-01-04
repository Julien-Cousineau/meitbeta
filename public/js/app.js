/*global $,extend,options,Header,Login,Modal,Api,io*/

$(document).ready(function() {const app = new App(options);});

function App(options){
  this.options = extend(Object.create(this.options), options);
  const self   = this;
  this.pointer = function(){return self;};
  this.api     = new Api();
  this.construct();
}

App.prototype ={
  options:{
    debug:true,
    language:'en',
    keywords:'en',
    emission: 'nox',
    mapLayer:'mapmeit',
    divider: 1000000,
    keyTags:'',
    panels:'',
    charts:'',
    emissions:'',
    units:'',
  },
  get language(){return this.options.language;},
  set language(value){this.options.language=value;},
  get keywords(){return this.options.keywords;},
  get emissions(){return this.options.emissions;},
  get mapLayer(){return this.options.mapLayer;},
  set mapLayer(value){this.options.mapLayer=value;},
  
  get emission(){return this.options.emission;},
  set emission(value){this.options.emission=value;console.log(value);this.refresh(true)},
  get divider(){return this.options.divider;},
  set divider(value){this.options.divider=value;console.log(value);this.refresh()},
  set unit(value){this.divider = this.units.find(item=>item.name===value).divider; },
  
  get units(){return this.options.units;},
  get keyTags(){return this.options.keyTags;},
  get panels(){return this.options.panels;},
  get geomaps(){return this.options.geomaps;},
  set geomaps(value){return this.options.geomaps=value;},
  get charts(){return this.options.charts;},
  set charts(value){this.options.charts=value;},
  
  
  get debug(){return this.options.debug;},
  refresh:function(changeGroup){
    if(this.mapd){
      if(changeGroup){
        this.mapd.changeGroup();
        this.mapd.reSizeAll();
      } else{
        this.mapd.reSizeAll();
        console.log("refresh");    
      }
    
    
    }
  },
  construct:function(){
    const self=this;
    if(this.debug)console.log("Constructing App")
    this.websocket();
    this.constructFunc();
    this.Upload = new Modal(this.pointer,{container:"body",name:'upload'});
    this.Login  = new Login(this.pointer,{container:"#login"})
    this.Header = new Header(this.pointer,{container:"#header"})
    this.Footer = new Footer(this.pointer,{container:".footer"})
    // this.LeftSide = new LeftSide(this.pointer,{})
    this.changeLanguage(this.language) //TODO: initialize labels
    this.grid = new Grid(this.pointer);
    // this.mapd = new MapD(this.pointer);
    this.mapContainer = new MapContainer(this.pointer,{},function(){
      self.mapd = new MapD(self.pointer);
    
      $('#bannerChevron').trigger("click");
    })
  },
  
  websocket:function(){
    const self=this;
    const socket = this.socket = io.connect();
    
    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
      });
        
    // socket.on('refreshfilelist', function(msg){
    //     self.Upload.getFileList();
    //   });
    // socket.on('getfiles', function(results){
    //     self.Upload.getFileList();
    // });
    // socket.on('gettables', function(results){
    //     self.Upload.getTableList();
    //   });
    // socket.on('getdatasets', function(results){
        
    //     self.Upload.getDatasetList(results);
    //   });           
      
    socket.on('connect', function () {
        console.log("connect")
      });
  
    // browser to client
    // socket.emit('chat message', $('#m').val());
  
  },
  constructFunc:function(){
    const self=this;
    
    this.changeLanguage = function(lang) {
      if(self.debug)console.log('Change Language');
      self.language=lang;
      self.changeLabels();
    };
    
    this.changeLanguageToggle = function() {
      if(self.debug)console.log('Change Language Toggle');
      self.language= (self.language==='en') ? 'fr':'en';
      self.changeLabels2();
    };
    
    this.getKey = function(key){
      var keywords = self.keywords;
      var language = self.language;
      return keywords.find(function(keyword){return keyword.id===key;})[language];
    };
    
    this.changeLabels2 = function() {
      var language        = self.language;
      var keywords        = self.keywords;
      var getKey          = self.getKey;
      // var chartsContainer = self.chartsContainer;
      // var rightIcons      = self.rightIcons;
      // var leftIcons       = self.leftIcons;

      
      self.keyTags.forEach(function(keyTag){
        if(keyTag.type==='text'){
          var key = keywords[keyTag.id]
          console.log(language)
          console.log(key[language])
          $(keyTag.tag).text(key[language]);
        } 
      });
      
      // rightIcons.forEach(function(filter){
      //   $('#{0}'.format(filter["id"])).attr('title',getKey(filter.title))
      //                                 .tooltip('fixTitle');
      //   $('#header_{0}'.format(filter["id"])).text(getKey(filter.title));                           
      // })
          
      // var elements =  $('.tab_chart')   
      // elements.each(function(){
      //   var id = $(this).attr('_id');
      //   var chart = chartsContainer.findChart(id)
      //   $(this).text(getKey(chart.title));
      // });
        
      // leftIcons.forEach(function(filter){
      //   $('#{0}'.format(filter["id"])).attr('title',getKey(filter.title))
      //                                 .tooltip('fixTitle');
      // });
    }
    
    this.changeLabels = function() {
        if(self.debug)console.log("change Labels")
        var language = self.language;
        var keywords = self.keywords;
      	self.keyTags.forEach(function(keyTag){
      	  
          var key = keywords[keyTag.id]
          console.log(language)
          $(keyTag.tag).text(key[language]);
        });
      };
  },
  upload:function(){
    if(this.debug)console.log("Upload")
  },
  checkLogin:function(){
    const self = this;
    $('#formuserinfo').validator()
    
    $('#saveuserinfo').click(function(e) {
      event.preventDefault();
      var user = JSON.parse(localStorage.getItem('userInfo'));
      if(user===null){console.log("No user info???-weird")}
      var metadata = user.user_metadata;
      metadata.first = $('#profile_first').val();
      metadata.last = $('#profile_last').val();
      metadata.company = $('#profile_company').val();
      if(self.debug)console.log(user)
    });
    
  },
}







