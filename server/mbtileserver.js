'use strict';

const util = require('./util');

const fs = require('fs');
const path = require('path')
const mbtiles = require('mbtiles');
const express = require('express');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const HEXFOLDER =  path.join(__dirname, '../../shareddrive/data/hex');




function MBTileServer(parent,checkJwt) {
  this._parent = parent;
  this.checkJwt = checkJwt;
  this.construct();
}
MBTileServer.prototype={
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  options:{
    tiles:{
      // hex: { mbtiles: 'hex.mbtiles' },
      hex16: { mbtiles: 'newhex16.mbtiles' },
      hex4:  { mbtiles: 'newhex4.mbtiles' },
      hex1:  { mbtiles: 'newhex1.mbtiles' },
      meit:  { mbtiles: 'meitregions.mbtiles' },
      prov:  { mbtiles: 'provinces.mbtiles' },
      cmeit: { mbtiles: 'cmeitregions.mbtiles' },
      cprov: { mbtiles: 'cprovinces.mbtiles' },
      terminals: { mbtiles: 'terminals.mbtiles' },
      // arcticpts: { mbtiles: 'arcticpts.mbtiles' },
      // pacificpts: { mbtiles: 'pacificpts.mbtiles' }
    }
  },
  construct:function(){
    const tiles = this.options.tiles;
    for(let id in tiles){
      let mbtilesFile = path.resolve(HEXFOLDER,tiles[id].mbtiles);
      let mbtilesFileStats = fs.statSync(mbtilesFile);
      if (!mbtilesFileStats.isFile() || mbtilesFileStats.size == 0) {
        throw Error('Not valid MBTiles file: ' + mbtilesFile);
      }
      
      let tileJSON = {};
      let source = new mbtiles(mbtilesFile, function(err) {
        if(err){console.log("Error 00:"+err)}
        source.getInfo(function(err, info) {
          if(err){console.log("Error 0: "+err)}
          tileJSON['name'] = id;
          tileJSON['format'] = 'pbf';
    
          Object.assign(tileJSON, info);
          tileJSON['tilejson'] = '2.0.0';
          delete tileJSON['filesize'];
          delete tileJSON['mtime'];
          delete tileJSON['scheme'];
    
          Object.assign(tileJSON, {});
          util.fixTileJSONCenter(tileJSON);
        });
      });
      
      
      let tilePattern = '/' + id + '/:z(\\d+)/:x(\\d+)/:y(\\d+).:format([\\w.]+)';
      let app = express().disable('x-powered-by');
      app.get(tilePattern, function(req, res, next) {
        let z = req.params.z | 0,
            x = req.params.x | 0,
            y = req.params.y | 0;
    
     
        if (z < tileJSON.minzoom || 0 || x < 0 || y < 0 ||
            z > tileJSON.maxzoom ||
            x >= Math.pow(2, z) || y >= Math.pow(2, z)) {
          
          return res.status(204).send('Out of bounds');
        }
        source.getTile(z, x, y, function(err, data, headers) {
           console.log(x+ " " + y + " " + z)
          if (err) {
            if (/does not exist/.test(err.message)) {
               return res.status(204).send(err.message);
            } else {
              return res.status(500).send(err.message);
            }
          } else {
              if (data == null) {
                 return res.status(204).send('Not found');
              } else {
                  headers['Content-Type'] = 'application/x-protobuf';  
                  delete headers['ETag']; 
                  headers['Content-Encoding'] = 'gzip';
                  res.set(headers);
                 return res.status(200).send(data);
                 }
          }
        });
      });
      this.parent.app.use('/private/tiles/',this.checkJwt,app);
    }
  },
};

module.exports = MBTileServer;