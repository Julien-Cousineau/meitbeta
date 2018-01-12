const DOW={0:"Mon",1:"Tue",2:"Wed",3:"Thu",4:"Fri",5:"Sat",6:"Sun"};
const options ={
  debug:true,
  language:'en',
  AUTH0:{
    AUTH0_CLIENT_ID:'QtyNHacFL1GhHcL7z5Ce3j34tPf3gJgB',
    AUTH0_DOMAIN:'nrc-ocre.auth0.com',  
    AUTH0_CALLBACK_URL:window.location.href,
    },
  IP :getHostName(window.location.href),
  URL : 'http://' + getHostName(window.location.href) + ':8080/',
  // IP : '52.228.71.184',
  // URL : 'http://52.228.71.184:8080/',  
  keywords:{
    username:{'en':"Username",'fr':"Nom d'utilisateur"},
    password:{'en':"Password",'fr':"Mot de passe"},
    signin:{'en':"Sign In",'fr':"Connectez-vous"},
    logout:{'en':"Log Out",fr:"Se déconnecter"},
    extent:{'en':"Extent",fr:"Étendue"},
    clear:{'en':"clear",fr:"effacé"},
    user:{'en':"User",'fr':"Utilisateur"},
    date:{'en':"Date",'fr':"Date"},
    forecastyear:{'en':"Forecast Year",'fr':"Prévision annual"},
    database:{'en':"Database",'fr':"Base de données"},
    comments:{'en':"Comments",'fr':"Commentaires"},
    emissions:{'en':"Emissions",'fr':"Émissions"},
    export:{'en':"Export",'fr':"Exporter"},
    sheets:{'en':"Sheets",'fr':"Fiches"},
    general:{'en':"General",'fr':"Général"},
    filename:{'en':"Filename",'fr':"Nom du fichier"},
    language:{'en':"Français",'fr':"English"},
    upload:{'en':"Upload",'fr':"Upload"},
    search:{'en':"Search",'fr':"Recherche"},
    title:{'en':"Marine Emission Inventory Tool (Beta Version)",'fr':"Outil d’inventaire des émissions des navires (version Beta)"},
    bbox:{'en':"Bounding Box",'fr':"Cadre"},
    tooltip:{'en':"Tooltip",'fr':"Tooltip"},
    filters:{'en':"Filters",'fr':"Filtres"},
    daterange:{'en':"Date range",'fr':"Période"},
    shipct:{'en':"Ship Class/Type",'fr':"Catégorie/Type de navire"},
    shipclass:{'en':"Ship Class",'fr':"Catégorie de navire"},
    meitregion:{'en':"MEIT Region",'fr':"Région MEIT"},
    shiptype:{'en':"Ship Type",'fr':"Type de navire"},
    emissionmode:{'en':"Emission Mode",'fr':"Code d'émission"},
    enginecode:{'en':"Engine Code",'fr':"Code de moteur"},
    meitregion:{'en':"MEIT Region",'fr':"Région MEIT"},
    prov:{'en':"Province",'fr':"Province"},
    hexgrid:{'en':"Hex Grid",'fr':"Grille hexagonale"},
    // datetime:{'en':"Date Time",'fr':"Temps"},
    // year:{'en':"Year",'fr':"Année"},
    // month:{'en':"Month",'fr':"Mois"},
    dow:{'en':"Day of Week",'fr':"Jour de semaine"},
    hour:{'en':"Hour",'fr':"Heure"},
    total:{'en':"Total",'fr':"Total"},
    hidepanels:{'en':"Hide Panels",'fr':"Cacher les panneaux"},
    unhidepanels:{'en':"Unhide Panels",'fr':"Décacher les panneaux"},
    
    // nox:{en:'Nitrogen Oxide',fr:'Oxyde de nitrogène'}, 
    // co:{en:'Carbon Monoxide',fr:'Monoxyde de carbone'},
    // hc:{en:'Hydrocarbon',fr:'Hydrocarbure'},
    // nh3:{en:'Ammonia',fr:'Ammoniac'}, 
    // co2:{en:'Carbon Dioxide',fr:'Dioxyde de carbone'}, 
    // ch4:{en:'Methane',fr:'Méthane'}, 
    // n2o:{en:'Nitrous Oxide',fr:'Oxyde nitreux'}, 
    // sox:{en:'Sulphur Oxide',fr:'Dioxyde de soufre '},
    // pm25:{en:'2.5µm Particulate Matter',fr:'Particules 2.5µm'}, 
    // pm10:{en:'10µm Particulate Matter',fr:'Particules 10µm'}, 
    // pm:{en:'Particulate Matter',fr:'Particules'}, 
    // bc:{en:'Black Carbon',fr:'Carbone noir'},
    
    nox:{en:'nox',fr:'nox'}, 
    co:{en:'co',fr:'co'},
    hc:{en:'hc',fr:'hc'},
    nh3:{en:'nh3',fr:'nh3'}, 
    co2:{en:'co2',fr:'co2'}, 
    ch4:{en:'ch4',fr:'ch4'}, 
    n2o:{en:'n2o',fr:'n2o'}, 
    sox:{en:'sox',fr:'sox'},
    pm25:{en:'pm25',fr:'pm25'}, 
    pm10:{en:'pm10',fr:'pm10'}, 
    pm:{en:'pm',fr:'pm'}, 
    bc:{en:'bc',fr:'bc'},
    fuel:{en:'fuel',fr:'fuel'},    
    
    g:{en:'grams',fr:'grammes'},
    kg:{en:'kilograms',fr:'kilogrammes'},
    t:{en:'tons',fr:'tonnes'},
    kt:{en:'kilotons',fr:'kilotonnes'},
    Mt:{en:'megatons',fr:'megatonnes'},
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
  gis:[
    {id:"mapmeit",keyword:"meitregion",checked:true},
    {id:"prov",keyword:"prov",checked:false},
    {id:"hexgrid",keyword:"hexgrid",checked:false}
    ],
  charts:[
  {id:"paneldate",checked:true,active:false,keyword:"daterange",icon:"fa fa-calendar",dim:'datet',dctype:'barChart',minMax:true,defaultscale:'',
    attributes:{xAxis:{tickFormat:dc.utils.customTimeFormat,orient:'bottom',},
                yAxis:{ticks:5}
    },   
    attributesFunc:{binParams:{minMax:function(minMax){return {numBins: 400,binBounds: [minMax.minimum,minMax.maximum]};}},
                            x:{minMax:function(minMax){return d3.time.scale.utc().domain([minMax.minimum,minMax.maximum]) }},
                   }
  },
  {id:"paneldow",checked:true,active:false,keyword:"dow",icon:"fa fa-calendar",dim:'datet',dctype:'barChart',defaultscale:'',
  attributes:{binParams:{timeBin: "dow",extract: true,numBins: 7,binBounds: [new Date(), new Date()]},
              xAxis:{tickFormat:function(p) {return DOW[p];},orient:'bottom'},
              yAxis:{ticks:5},
              x:d3.scale.ordinal(),
              xUnits:dc.units.ordinal,
              barPadding:0.1,
              outerPadding:0.05,
             }
    
  },
  {id:"panelhour",checked:true,active:false,keyword:"hour",icon:"fa fa-calendar",dim:'datet',dctype:'barChart',defaultscale:'',
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
  {id:"panelclass",checked:true,active:false,keyword:"shipclass",icon:"fa fa-ship",dim:'class',dctype:'rowChart',defaultscale:'',attributes:{}},
  {id:"paneltype",checked:true,active:false,keyword:"shiptype",icon:"fa fa-ship",dim:'type',dctype:'rowChart',defaultscale:'',attributes:{}},
  {id:"panelmeit",checked:true,active:false,keyword:"meitregion",icon:"fa fa-map",dim:'meit',dctype:'pieChart',defaultscale:'',attributes:{}},
  {id:"panelmode",checked:true,active:false,keyword:"emissionmode",icon:"fa fa-modx",dim:'mode',dctype:'pieChart',defaultscale:'',attributes:{}},
  {id:"panelengine",checked:true,active:false,keyword:"enginecode",icon:"fa fa-cogs",dim:'engine',dctype:'pieChart',defaultscale:'',attributes:{}},
  ],
  geomaps:{
    lng:{dim:'lng',minimum:-1,maximum:-1},
    lat:{dim:'lat',minimum:-1,maximum:-1},
    mapmeit:{dim:'mapmeit',minimum:-1,maximum:-1},
    prov:{dim:'prov',minimum:-1,maximum:-1},
    hex16:{dim:'hex_16',minimum:0,maximum:7},
    hex4:{dim:'hex_4',minimum:8,maximum:12},
    // hex1:{dim:'hex_1',minimum:12,maximum:14},
  },
  emissions: [
  {id:'nox',keyword:'nox',checked:true}, 
  {id:'co',keyword:'co',checked:true},
  {id:'hc',keyword:'hc',checked:true}, 
  {id:'nh3',keyword:'nh3',checked:true}, 
  {id:'co2',keyword:'co2',checked:true}, 
  {id:'ch4',keyword: 'ch4',checked:true}, 
  {id:'n2o',keyword: 'n2o',checked:true}, 
  {id:'sox',keyword: 'sox',checked:true}, 
  {id:'pm25',keyword: 'pm25',checked:true}, 
  {id:'pm10',keyword: 'pm10',checked:true}, 
  {id:'pm',keyword: 'pm',checked:true}, 
  {id:'bc',keyword: 'bc',checked:true}
  ],
  units:[
    {id:'g',keyword:'grams',divider:1}, 
    {id:'kg',keyword:'kilograms',divider:1000},
    {id:'t',keyword:'tonnes',divider:1000000}, 
    {id:'kt',keyword:'kilotonnes',divider:1000000000}, 
    {id:'Mt',keyword:'megatonnes',divider:1000000000000}, 
  ],
  years:[
    {id:'2015',keyword:'2015'},
    {id:'2020',keyword:'2020'},
    {id:'2025',keyword:'2025'},
    {id:'2030',keyword:'2030'},
    {id:'2035',keyword:'2035'},
    {id:'2040',keyword:'2040'},
    {id:'2045',keyword:'2045'},
    {id:'2050',keyword:'2050'},
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


  