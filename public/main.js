/*global $,extend,options,Header,Login,Modal,Api,io*/

$(document).ready(function() {const app = new App(options);});

function App(options){
  this.options = extend(Object.create(this.options), options);
  const self   = this;
  this.pointer = function(){return self;};
  this.construct();
}

App.prototype ={
  options:{
    debug:true,
  },
 
  
  get AUTH0(){return this.options.AUTH0;},
  get debug(){return this.options.debug;},
  construct:function(){
    const self=this;
    if(this.debug)console.log("Constructing App")
    
    this.login = new Login(this.pointer,{});
    this.login.parseHash();
    
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




function addScript( src,callback) {
  var s = document.createElement( 'script' );
  s.setAttribute( 'src', src );
  s.onload=callback;
  document.body.appendChild( s );
}


$.getMultiScripts = function(arr, path,options) {
    var _arr = $.map(arr, function(scr) {
        var re = /(?:\.([^.]+))?$/;
        var ext = re.exec(scr)[1];
        options.ext=ext;
        // var type = (ext=='css')?'getStylesheet':'getScript';
        // var type= 
        return $.cachedScript( (path||"") + scr,options,function(data){
            if(ext=='css'){
              console.log("herehere")
             $('<style type="text/css"></style>')
              .html(data)
              .appendTo("head");
            }
        });
    });

    _arr.push($.Deferred(function( deferred ){
        $( deferred.resolve );
    }));

    return $.when.apply($, _arr);
};

$.cachedScript = function( url, options,callback ) {
  // Allow user to set any option except for dataType, cache, and url
  var datatype= (options.ext=='css')?'text':'script';
  options = $.extend( options || {}, {
    dataType: datatype,
    success:callback,
    cache: true,
    url: url,
    async: true,
  });
 console.log(options)
  // Use $.ajax() since it is more flexible than $.getScript
  // Return the jqXHR object so we can chain callbacks
  return $.ajax( options );
};