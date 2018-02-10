const util = require('./util');
const http = require('http');
const socketio = require('socket.io');
const socketioJwt = require('socketio-jwt');

function Socket(parent,options){
    const self=this;
    this._parent = parent;
    this.options = util.extend(Object.create(this.options), options);
    this.construct();
}
Socket.prototype = {
    options:{
        
    },
    get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
    get dataserver(){return this.parent.dataserver;},
    get app(){return this.parent.app},
    construct:function(){
      const server = this.parent.server = http.createServer(this.app);
      const socket = this.socket = socketio(server);
      const self=this;
      console.log(process.env.AUTH0_CLIENT_SECRET)
      
      socket.on('connection', socketioJwt.authorize({
  		  secret: process.env.AUTH0_CLIENT_SECRET,
  		  timeout: 15000 // 15 seconds to send the authentication message
  	  }))
  	  .on('authenticated', function(socket){
  		  console.log('connected & authenticated: ' + JSON.stringify(socket.decoded_token));
  		
		
		    const getfiles = function(){
          self.dataserver.files.getList(function(err,array){
            if(err)console.log("Error on getfiles");
            const obj={meta:'',data:array};
            socket.emit('getfiles', obj);
          });
        };
        const getdatasets = function(){
          self.dataserver.datasets.getList(function(err,list){
            if(err)return socket.emit('newdataseterror', list);
            const obj={meta:'',data:list};
            socket.emit('getdatasets', obj);
          });
        };
        
    		socket.on('getkeys',function(){
    		  const mapd=JSON.parse(process.env.MAPD);
    		  const mapbox=process.env.MAPBOXTOKEN;
    		  const obj={mapbox:mapbox,mapd:mapd};
    		  socket.emit('getkeys',obj);
    		});
    		socket.on('getfiles', function(){
          getfiles();
        });
        
        socket.on('deletefile', function(obj){
          self.dataserver.files.remove(obj,function(){
            getfiles();
          });
        });
        socket.on("changedefaultdataset",function(obj){
          self.dataserver.datasets.changeDefault(obj.name,()=>getdatasets())
        });
        socket.on("changepublicdataset",function(obj){
          self.dataserver.datasets.changePublic(obj.name,()=>getdatasets())
        });        
        socket.on('getdatasets', function(){
          getdatasets();
        });
        socket.on('initialdatasets', function(callback){
          self.dataserver.datasets.getList(callback);
        });
        
        socket.on('newdataset', function(name){
          console.log(name)
          self.dataserver.datasets.add(name,function(err,results){
            console.log(results)
            if(err)return socket.emit('newdataseterror', results);
            getdatasets();
          });
        });  
        socket.on('deletedataset', function(obj){
          self.dataserver.datasets.remove(obj,function(err,results){
            if(err)console.log(results)
            getdatasets();
          });
        });
        const getview = function(dataset){
          self.dataserver.datasets.getView(dataset.name,function(err,array){
            const obj={meta:{dataset:dataset},data:array};
            socket.emit('getview', obj);
          });
        };
        socket.on('getview', function(dataset){
          getview(dataset);
        });
        socket.on('addfiledataset', function(obj){
            self.dataserver.converts.add(obj,function(err,meta){
              console.log(meta)
              meta.htmlid = obj.htmlid;
              socket.emit('addfiledataset', meta);
              if(meta.action==="upload done"){
                getview(obj.dataset)
              }
            });
        });
        socket.on('disconnect', function () {
          console.log('a user disconnected');
        });
  	  });
    },
    
};

module.exports = Socket;