const CONVERT = require('./convert');
const options={
           csvinput:[
            //   'dummy.csv',
              'arcticWIG_09212017.csv',
              'pacificWIG_09212017.csv',
              'eastWIG_09122017.csv',
               ],
           csvoutput:'processed.csv',
           meitinput:'meitregions.geojson',
           hexinput:[
               {id:16,file:'hex_16.hex'},
                {id:4,file:'hex_4.hex'},
              {id:1,file:'hex_1.hex'}
               ],
           shipinput:[{id:0,file:'pacific_growth_factors_11212017.csv'},{id:1,file:'east_arctic_greatlakes_growth_factors_11212017.csv'}],
}


const meit = new CONVERT(options);