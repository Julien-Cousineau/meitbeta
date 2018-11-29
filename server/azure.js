require('dotenv').config()
const azure = require('azure-storage');
const fs = require('fs');
const blobSvc = azure.createBlobService();
const prettyBytes = require('pretty-bytes');
const async = require('async');
const path = require('path');

const UPLOADFOLDER = '../shareddrive/data/upload/'
const DOWNLOADFOLDER = '../shareddrive/data/upload/'
// const deletelist =[
// 'sep21_processed',
// 'sep21_grid',
// 'sep21_server',
// ];
// deletelist.forEach(item=>{
// blobSvc.deleteBlob('ecmeit', item, function(error, response){
//   if(!error){
//     // Blob has been deleted
//   }
// });    
// });

// blobSvc.getBlobToStream('ecmeit', 'arcticWIG_09212017', fs.createWriteStream('arcticWIG_09212017.zip'), function(error, result, response){
//   if(!error){
//     // blob retrieved
//   }
// });
main()
function main(){
  getList(function(){
    
  })
  // let list=[{name:"east_arctic_greatlakes_growth_factors_11212017",file:"east_arctic_greatlakes_growth_factors_11212017.csv"},
  //           {name:"pacific_growth_factors_11212017",file:"pacific_growth_factors_11212017.csv"}
  //         ]
    // let list=[
    //         // {name:"hex_1",file:"hex_1.hex"},
    //         // {name:"hex_4",file:"hex_4.hex"},
    //         // {name:"hex_16",file:"hex_16.hex"},
    //         // {name:"pacific_growth_factors_11212017",file:"pacific_growth_factors_11212017.csv"},
    //         // {name:"east_arctic_greatlakes_growth_factors_11212017",file:"east_arctic_greatlakes_growth_factors_11212017.csv"},
    //         // {name:"arcticWIG_09212017",file:"arcticWIG_09212017.zip"},
    //         // {name:"nov30_grid",file:"nov30_grid.zip"},
    //         // {name:"east_arctic_emissions_10252017",file:"east_arctic_emissions_10252017.zip"},
    //         // {name:"pacific_emissions_11162017",file:"pacific_emissions_11162017.zip"},
    //       ]
    let list=[
      // {name:"pacific_growth_factors_11212017",file:"pacific_growth_factors_11212017.csv"},
      // {name:"east_arctic_greatlakes_growth_factors_11212017",file:"east_arctic_greatlakes_growth_factors_11212017.csv"},
      // {name:'cprovincesmbtiles',file:'cprovinces.mbtiles'},
      // {name:'meitregionsmbtiles',file:'meitregions.mbtiles'},
      // {name:'cmeitregionsmbtiles',file:'cmeitregions.mbtiles'},
      // {name:'provincesmbtiles',file:'provinces.mbtiles'},
      // {name:'terminalsmbtiles',file:'terminals.mbtiles'},
      // {name:'hexmbtiles',file:'hex.mbtiles'},
      // {name:'cterminalsmbtiles',file:'terminals.mbtiles'},
      // {name:'meitregionsgeojson',file:'meitregions.geojson'},
      // {name:'provincesgeojson',file:'provinces.geojson'},
      // {name:"hex_1",file:"hex_1.hex"},
      // {name:"hex_4",file:"hex_4.hex"},
      // {name:"hex_16",file:"hex_16.hex"},
      
      // {name:"pacificWIG_09212017",file:"pacificWIG_09212017.zip"}, //21Sept
      // {name:"eastWIG_09212017",file:"eastWIG_09212017.zip"}, //21Sept and Nov29
      // {name:"arcticWIG_09212017",file:"arcticWIG_09212017.zip"}, //21Sept and Nov29
      
      // {name:"pacific_emissions_11162017",file:"pacific_emissions_11162017.zip"}, //Nov29
      // {name:"east_arctic_emissions_10252017",file:"east_arctic_emissions_10252017.zip"},
      
      // {name:"arctic_emissions_01102018",file:"arctic_emissions_01102018.zip"},
      // {name:"pacific_emissions_01042018",file:"pacific_emissions_01042018.zip"},
      // {name:"hex_16",file:"hex_16.mbtiles"},
      // {name:"hex_4",file:"hex_4.mbtiles"},
      // {name:"hex_1",file:"hex_1.mbtiles"},
      // {name:"east_emissions_20180117",file:"east_emissions_20180117.zip"},
      // {name:"pacific_WebtideIndexedGridded",file:"pacific_WebtideIndexedGridded.zip"},
      //{name:"newhex16",file:"newhex16.hex"},
      //{name:"newhex4",file:"newhex4.hex"},
      // {name:"newhex1",file:"newhex1.hex"},
      // {name:"newhex16mbtiles",file:"newhex16.mbtiles"},
      // {name:"newhex4mbtiles",file:"newhex4.mbtiles"},
      // {name:"newhex1mbtiles",file:"newhex1.mbtiles"},
      //{name:"arctic_emissions_02132018_11062017DS",file:"arctic_emissions_02132018_11062017DS.zip"},
      //{name:"forecast_factors_02152018",file:"forecast_factors_02152018.zip"},
      //{name:"arctic_emissions_2018-04-10",file:"arctic_emissions_2018-04-10.zip"},
      //{name:"pacific_emissions_2018-05-02",file:"pacific_emissions_2018-05-02.zip"},
      //{name:"east_emissions_2018-04-17",file:"east_emissions_2018-04-17.zip"},
      //{name:"pacific_fishing_emissions_2018-05-09",file:"pacific_fishing_emissions_2018-05-09.zip"},
      {name:"arctic_emissions_2018-05-28",file:"arctic_emissions_2018-05-28.zip"},
      {name:"pacific_emissions_2018-05-02",file:"pacific_emissions_2018-05-02.zip"},
      {name:"east_emissions_2018-04-17",file:"east_emissions_2018-04-17.zip"},
      
      ];
  
  download(list,function(e){
    console.log("Done")
  })
  //   upload(list,function(e){
  //   console.log("Done")
  // })
  
}

function upload(list,maincallback){
  const write = function(item,callback){
    console.log("Uploading " + item.name);
    const name = item.name, file = path.resolve(UPLOADFOLDER,item.file);
    fs.stat(file, function(error, stat) {
      if (error) { throw error; }
      const stream = fs.createReadStream(file);
      blobSvc.createBlockBlobFromStream('ecmeit', name,stream,stat.size, function(error, response){
        if(error)throw Error(response);
        callback();
      });
    });
  };
  async.eachSeries(list, write, function(e){
    if(e)throw Error("Error here");
    maincallback();
  });
}

function download(list,maincallback){
  const read = function(item,callback){
    console.log("Downloading " + item.name);
    const name = item.name, file = path.resolve(DOWNLOADFOLDER,item.file);
    blobSvc.getBlobToStream('ecmeit', name, fs.createWriteStream(file), function(error, result, response){
      if(error)throw Error(response);
      callback();
    });
  };
  async.eachSeries(list, read, function(e){
    if(e)throw Error("Error here");
    maincallback();
  });
}

function getList(callback){
  blobSvc.listBlobsSegmented('ecmeit', null, function(error, result, response){
    if(!error){
      const entries = result.entries;
      const a = entries.sort(function(a, b) { return new Date(a.lastModified) - new Date(b.lastModified) });
      let total=0;
      a.forEach(entry=>{
        total+=parseFloat(entry.contentLength);
        console.log(entry.name,entry.lastModified,prettyBytes(parseFloat(entry.contentLength)))}
      );
      console.log('Total:',prettyBytes(total));
      callback();
    }
  });
}

