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
    KEYS:{},
    debug:true,
    loaded:false,
    language:'en',
    keywords:'en',
    emission: 'nox',
    mapLayer:'mapmeit',
    mapDLayer:'mapmeit',
    table:'table5',
    tables:[],
    divider: 1000000,
    keyTags:'',
    panels:'',
    charts:'',
    emissions:'',
    unit:'t',
    units:'',
    years:'',
    year:'2015',
    container:"#home",
  },
  get id_token(){if(!(this._id_token)){this._id_token=localStorage.getItem('id_token');};return this._id_token;},
  set id_token(value){this._id_token=value;},
  get access_token(){if(!(this._access_token)){this._access_token=localStorage.getItem('access_token');};return this._access_token;},
  set acess_token(value){this._acess_token=value;},  
  get KEYS(){return this.options.KEYS;},
  set KEYS(value){this.options.KEYS=value;},
  get loaded(){return this.options.loaded;},
  set loaded(value){this.options.loaded=value;},
  get container(){return this.options.container;},
  get table(){return this.options.table;},
  set table(value){this.options.table=value;if(this.loaded)this.mapd.createCrossFilter();},
  get tables(){return this.options.tables;},
  set tables(value){this.options.tables=value;},
  get publictables(){
    if(this.userInfo.app_metadata.roles[0]=="admin"){return this.tables}
    else {
      return this.tables.reduce((acc,item)=>{console.log(item.public);if(item.public)acc.push(item);return acc},[]);
    }
    
  },
  get language(){return this.options.language;},
  set language(value){this.options.language=value;},
  get keywords(){return this.options.keywords;},
  get emissions(){return this.options.emissions;},
  get mapLayer(){return this.options.mapLayer;},
  set mapLayer(value){this.options.mapLayer=value;this.setmapDLayer();},
  get mapDLayer(){return this.options.mapDLayer;},
  // get access_token(){if(!(this._access_token)){this._access_token=localStorage.getItem('access_token');}
  //   return this._access_token;    
  // },
  // get id_token(){if(!(this._id_token)){this._id_token=localStorage.getItem('id_token');}
  //   return this._id_token;
  // },
  get userInfo(){
    if(!(this._userInfo)){
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      // const userInfo = {first:"Julien"};
      if(!(userInfo)){this.logout();}
      this._userInfo=userInfo;
    }
    return this._userInfo;
  },
  logout:function() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('userInfo');
    window.location.href = "/";
  },
  // set mapDLayer(value){this.options.mapDLayer=value;},
  setmapDLayer:function(){
    const mapLayer=this.mapLayer;
    const zoom = this.mapContainer.zoom;
    if(mapLayer==='mapmeit'||mapLayer==='prov'){this.options.mapDLayer=mapLayer;return;}
    const oldMapDLayer = this.options.mapDLayer;
    for(let key in this.geomaps){
        let layer = this.geomaps[key];
        if(zoom >=layer.minimum && zoom<=layer.maximum)this.options.mapDLayer=key;
    }
    return !(oldMapDLayer==this.options.mapDLayer);
  },
  
  get emission(){return this.options.emission;},
  set emission(value){this.options.emission=value;this.mapd.changeGroup();},
  get divider(){return this.options.divider;},
  set divider(value){this.options.divider=value},
  get unit(){return this.options.unit;},
  get unitdname(){return this.units.find(item=>item.id===this.unit).keyword;},
  set unit(value){this.options.unit=value;this.divider = this.units.find(item=>item.id===value).divider; },
  get year(){return this.options.year;},
  set year(value){this.options.year=value;this.mapd.changeGroup();},
  
  get AUTH0(){return this.options.AUTH0;},
  get units(){return this.options.units;},
  get years(){return this.options.years;},
  get keyTags(){return this.options.keyTags;},
  get panels(){return this.options.panels;},
  get geomaps(){return this.options.geomaps;},
  set geomaps(value){return this.options.geomaps=value;},
  get gis(){return this.options.gis;},
  get charts(){return this.options.charts;},
  set charts(value){this.options.charts=value;},
  
  get debug(){return this.options.debug;},
  refresh:function(){
    const self=this;
    if(this.mapd){
      console.log("refresh")
      self.mapd.reSizeAll()
      // debounce(function(){self.mapd.reSizeAll()}, 100)
    }
  },
  construct:function(){
    if(this.debug)console.log("Constructing App");
    this.show();
    
  },
  show:function(){
    this.render();
    this.Socket = new Socket(this.pointer);
  },
  loadApp:function(){
    this.header = new Header(this.pointer,{container:"#header"});
    this.Upload = new Modal(this.pointer,{container:"body",name:'upload'});
  },
  
  loadMapD:function(){
    const self=this;
    this.Footer = new Footer(this.pointer,{container:".footer"})
    this.mapd = new MapD(this.pointer);
    this.ExportC = new ExportC(this.pointer,{container:"body"});
    this.changeLanguage(this.language) //TODO: initialize labels
    this.grid = new Grid(this.pointer);
    // this.mapd = new MapD(this.pointer);
    this.mapContainer = new MapContainer(this.pointer,{},function(){
      $('#bannerChevron').trigger("click");
      self.loaded=true;
      $('[data-toggle="tooltip"]').tooltip({ trigger: "hover",flip:false });
      $('.dropdown-toggle').dropdown({ flip:false })
      self.changeLabels();
      self.mapd.getMap();
    });
    
  },
  changeLanguage:function(lang) {
    if(this.debug)console.log('Change Language');
    this.language=lang;
    this.changeLabels();
  },
  changeLanguageToggle:function() {
    if(this.debug)console.log('Change Language Toggle');
    this.language= (this.language==='en') ? 'fr':'en';
    this.changeLabels();
  },
  getKey:function(key){
    return this.keywords.find(function(keyword){return keyword.id===key;})[this.language];
  },
  changeLabels:function() {
    const self=this;
    // this.keyTags.forEach(function(keyTag){
    //   const key = this.keywords[keyTag.id];
    //   $(keyTag.tag).text(key[this.language]);
    // },this);
    console.log()
    $("*[keyword]").each(function(){
      const keyword=$(this).attr("keyword");
      const keywordType=$(this).attr("keywordType");
      if(keywordType==='emission' ||keywordType==='unit')return $(this).text(self.keywords[self[keywordType]][self.language]);
      if(keywordType==='year')return $(this).text(self[keywordType]);
      if(!(self.keywords[keyword])){
        return;
        // return console.log("WARNING:keyword({0}) does not exist".format(keyword));
      }
      if(keywordType==="text")return $(this).text(self.keywords[keyword][self.language]);
      if(keywordType==="placeholder")return $(this).attr("placeholder",self.keywords[keyword][self.language]);
      if(keywordType==="title"){return $(this).attr("data-original-title",self.keywords[keyword][self.language]).tooltip();}
    })
    
  },  
  render:function(){
    $(this.container).append(this.renderhtml);
  },
  get renderhtml(){
    return `
    <div id="header"></div>
    <div id="mapcontainer"><div id="map"></div></div>
    <div class="bodyContainer">
      <!--<div class="sidebar left"></div>-->
      <div class="footer"></div>
    </div>
    `;
  },
}







