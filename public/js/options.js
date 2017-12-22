const DOW={0:"Mon",1:"Tue",2:"Wed",3:"Thu",4:"Fri",5:"Sat",6:"Sun"};
const options ={
  debug:true,
  language:'en',
  AUTH0_CLIENT_ID:'QtyNHacFL1GhHcL7z5Ce3j34tPf3gJgB',
  AUTH0_DOMAIN:'nrc-ocre.auth0.com',
  // AUTH0_SECRET:'31dlg3bM_Sc1xS8rpeEUYx0n5H635UbdKvnDWLWcphyJ5R-tyBN76k-fmskC9HbA',
  AUTH0_CALLBACK_URL:window.location.href,
  IP : 'http://52.242.33.125:8080/',
  keywords:{
    username:{'en':"Username",'fr':"Nom d'utilisateur"},
    password:{'en':"Password",'fr':"Mot de passe"},
    signin:{'en':"Sign In",'fr':"Connectez-vous"},
    language:{'en':"Français",'fr':"English"},
    title:{'en':"Marine Emission Inventory Tool (Alpha Version)",'fr':"Outil d’inventaire des émissions des navires (version Alpha)"},
    bbox:{'en':"Bounding Box",'fr':"Cadre"},
    tooltip:{'en':"Tooltip",'fr':"Tooltip"},
    filters:{'en':"Filters",'fr':"Filtres"},
    daterange:{'en':"Date range",'fr':"Période"},
    shipct:{'en':"Ship Class/Type",'fr':"Catégorie/Type de navire"},
    shipclass:{'en':"Ship Class",'fr':"Catégorie de navire"},
    meitregion:{'en':"MEIT Region",'fr':"Region MEIT"},
    shiptype:{'en':"Ship Type",'fr':"Type de navire"},
    emissionmode:{'en':"Emission Mode",'fr':"Code d'émission"},
    enginecode:{'en':"Engine Code",'fr':"Code de moteur"},
    // datetime:{'en':"Date Time",'fr':"Temps"},
    // year:{'en':"Year",'fr':"Année"},
    // month:{'en':"Month",'fr':"Mois"},
    dow:{'en':"Day of Week",'fr':"Jour de semaine"},
    hour:{'en':"Hour",'fr':"Heure"},
    total:{'en':"Total",'fr':"Filtres"},
    hidepanels:{'en':"Hide Panels",'fr':"Cacher les panneaux"},
    unhidepanels:{'en':"Unhide Panels",'fr':"Décacher les panneaux"}
  },
  keyTags:[
  {tag:"#openForm",type:'text',id:"signin"},
  {tag:".form-title",type:'text',id:"signin"},
  {tag:"#btn-login",type:'text',id:"signin"},
  {tag:"div.bannerText",type:'text',id:"title"},
  {tag:"#lusername",type:'text',id:"username"},
  {tag:"#lpassword",type:'text',id:"password"},
  {tag:".LGbtn",type:'text',id:"language"},
  {tag:".LGbtn2",type:'text',id:"language"},
  {tag:".LGbtn2",type:'text',id:"language"},
  ],
  charts:[
  {id:"paneldate",active:false,keyword:"daterange",icon:"fa fa-calendar",dim:'datet',dctype:'barChart',minMax:true,defaultscale:'',
    attributes:{xAxis:{tickFormat:dc.utils.customTimeFormat,orient:'bottom',},
                yAxis:{ticks:5}
    },   
    attributesFunc:{binParams:{minMax:function(minMax){return {numBins: 400,binBounds: [minMax.minimum,minMax.maximum]};}},
                            x:{minMax:function(minMax){return d3.time.scale.utc().domain([minMax.minimum,minMax.maximum]) }},
                   }
  },
  {id:"paneldow",active:false,keyword:"dow",icon:"fa fa-calendar",dim:'datet',dctype:'barChart',defaultscale:'',
  attributes:{binParams:{timeBin: "dow",extract: true,numBins: 7,binBounds: [new Date(), new Date()]},
              xAxis:{tickFormat:function(p) {return DOW[p];},orient:'bottom'},
              yAxis:{ticks:5},
              x:d3.scale.ordinal(),
              xUnits:dc.units.ordinal,
              barPadding:0.1,
              outerPadding:0.05,
             }
    
  },
  {id:"panelhour",active:false,keyword:"hour",icon:"fa fa-calendar",dim:'datet',dctype:'barChart',defaultscale:'',
  attributes:{binParams:{timeBin: "hour",extract: true,numBins: 24,binBounds: [new Date(), new Date()]},
              xAxis:{orient:'bottom'},
              yAxis:{ticks:5},
              // x:d3.scale.linear().domain([0,24]),
              x:d3.scale.ordinal(),
              xUnits:dc.units.ordinal,
              barPadding:0.1,
              outerPadding:0.05,
             }
    
  },
  // {id:"panelclass",active:false,keyword:"shipclass",icon:"fa fa-ship",dim:'class',dctype:'rowChart',defaultscale:'',attributes:{}},
  // {id:"paneltype",active:false,keyword:"shiptype",icon:"fa fa-ship",dim:'type',dctype:'rowChart',defaultscale:'',attributes:{}},
  // {id:"panelmeit",active:false,keyword:"meitregion",icon:"fa fa-map",dim:'meit',dctype:'pieChart',defaultscale:'',attributes:{}},
  // {id:"panelmode",active:false,keyword:"emissionmode",icon:"fa fa-modx",dim:'mode',dctype:'pieChart',defaultscale:'',attributes:{}},
  // {id:"panelengine",active:false,keyword:"enginecode",icon:"fa fa-cogs",dim:'engine',dctype:'pieChart',defaultscale:'',attributes:{}},
  ],
  geomaps:{
    lng:{dim:'lng',minimum:-1,maximum:-1},
    lat:{dim:'lat',minimum:-1,maximum:-1},
    mapmeit:{dim:'mapmeit',minimum:0,maximum:3},
    hex16:{dim:'hex_16',minimum:4,maximum:7},
    // hex4:{dim:'hex_4',minimum:8,maximum:12},
    // hex1:{dim:'hex_1',minimum:12,maximum:14},
  },
  emissions: [
  {id:0,name:'nox',dname:'Nitrogen Oxide'}, 
  {id:1,name:'co',dname:'Carbon Monoxide'},
  {id:2,name:'hc',dname:'Hydrocarbon'}, 
  {id:3,name:'nh3',dname:'Ammonia'}, 
  {id:4,name:'co2',dname:'Carbon Dioxide'}, 
  {id:5,name:'ch4',dname: 'Methane'}, 
  {id:6,name:'n2o',dname: 'Nitrous Oxide'}, 
  {id:7,name:'sox',dname: 'Sulphur Oxide'}, 
  {id:8,name:'pm25',dname: '2.5µm Particulate Matter'}, 
  {id:9,name:'pm10',dname: '10µm Particulate Matter'}, 
  {id:10,name:'pm',dname: 'Particulate Matter'}, 
  {id:11,name:'bc',dname: 'Black Carbon'}
  ],
  units:[
    {id:0,name:'g',dname:'grams',divider:1}, 
    {id:1,name:'kg',dname:'kilograms',divider:1000},
    {id:2,name:'t',dname:'tonnes',divider:1000000}, 
    {id:3,name:'kt',dname:'kilotonnes',divider:1000000000}, 
    {id:4,name:'Mt',dname:'megatonnes',divider:1000000000000}, 
  ], 

  // charts:{
  //   // total:{keyword:'total',dim:'total',dctype:'numberDisplay',defaultscale:''},
  //   // datet:{keyword:'daterange',dim:'datet',dctype:'barChart',defaultscale:''},
  //   // meit:{keyword:'meitregion',dim:'meit',dctype:'pieChart',defaultscale:'',attributes:{}},
  //   class:{keyword:'shipclass',dim:'class',dctype:'rowChart',defaultscale:'',attributes:{}},
  //   type:{keyword:'shiptype',dim:'type',dctype:'rowChart',defaultscale:'',attributes:{}},
  //   mode:{keyword:'emissionmode',dim:'mode',dctype:'pieChart',defaultscale:'',attributes:{}},
  //   engine:{keyword:'enginecode',dim:'engine',dctype:'pieChart',defaultscale:'',attributes:{}},
  //   },
  
  
  
};


  