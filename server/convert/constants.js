const YEARS = ['2020','2025','2030','2035','2040','2045','2050'];
exports.YEARS = YEARS;
exports.ENGINES = {'me':0,'ae':1,'bo':2};
exports.MODES = {'Underway':0,'Anchored':1,'Berthed Loading':2,'Berthed Unloading':3};
const EMISSIONS = ['nox','co','hc','nh3','co2','ch4','n2o','sox','pm25','pm10','pm','bc'];
exports.EMISSIONS = EMISSIONS;
exports.REGIONS = Array.from(new Array(24), (x,i) => i-1);
const MAPFIELDS = [    
    'lng',
    'lat',
    'meit',
    'mapmeit',
    'hex_16',
    'hex_4',
    'hex_1'];
exports.MAPFIELDS = MAPFIELDS;
const noxfactors = YEARS.map(year=>'nox'+year);
const otherfactors = YEARS.map(year=>'other'+year);
exports.FIELDS=[
    // 'ship_id',
    'class',
    'type',
    // 'ip',
    'mode',
    'engine',
    'datetime',
    // 'point_id'
    ].concat(MAPFIELDS,EMISSIONS,noxfactors,otherfactors);