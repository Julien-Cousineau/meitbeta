const options ={
  debug:true,
  language:'en',
  AUTH0_CLIENT_ID:'QtyNHacFL1GhHcL7z5Ce3j34tPf3gJgB',
  AUTH0_DOMAIN:'nrc-ocre.auth0.com',
  // AUTH0_SECRET:'31dlg3bM_Sc1xS8rpeEUYx0n5H635UbdKvnDWLWcphyJ5R-tyBN76k-fmskC9HbA',
  AUTH0_CALLBACK_URL:window.location.href,
  // IP : 'http://ec-meit-dev.ca:8080/',
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
    // dow:{'en':"Day of Week",'fr':"Jour de semaine"},
    // hour:{'en':"Hour",'fr':"Heure"},
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
  panels:[
  // {id:"paneldate",active:false,keyword:"daterange",icon:"fa fa-calendar",dimensionids:['datet']},
  {id:"panelclass",active:false,keyword:"shipclass",icon:"fa fa-ship",dimensionids:['class']},
  // {id:"paneltype",active:false,keyword:"shiptype",icon:"fa fa-ship",dimensionids:['type']},
  {id:"panelmeit",active:false,keyword:"meitregion",icon:"fa fa-map",dimensionids:['meit']},
  // {id:"panelmode",active:false,keyword:"emissionmode",icon:"fa fa-modx",dimensionids:['mode']},
  // {id:"panelengine",active:false,keyword:"enginecode",icon:"fa fa-cogs",dimensionids:['engine']},
  ],
  charts:{
    // total:{keyword:'total',dim:'total',dctype:'numberDisplay',defaultscale:''},
    // datet:{keyword:'daterange',dim:'datet',dctype:'barChart',defaultscale:''},
    meit:{keyword:'meitregion',dim:'meit',dctype:'pieChart',defaultscale:'',attributes:{}},
    class:{keyword:'shipclass',dim:'class',dctype:'rowChart',defaultscale:'',attributes:{}},
    // type:{keyword:'shiptype',dim:'type',dctype:'rowChart',defaultscale:''},
    // mode:{keyword:'emissionmode',dim:'mode',dctype:'pieChart',defaultscale:''},
    // engine:{keyword:'enginecode',dim:'engine',dctype:'pieChart',defaultscale:''},
    },
  
  
  
};


  