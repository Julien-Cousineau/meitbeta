const toJSON = require('shp2json');
const fs  = require('fs');

const input = '../../data/hex/meit_provinces_2/meitprovinces.shp';
const output = './provinces.geojson';
const outstream = fs.createWriteStream(output);
toJSON.fromShpFile(input).pipe(outstream);