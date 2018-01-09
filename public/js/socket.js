
function Socket(parent){
  this._parent = parent;
  this.construct();
    
}
Socket.prototype ={
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get loaded(){return this.parent.loaded;},
  construct:function(){
    const self=this;
    const socket = this.socket = io.connect();
    const id_token = this.parent.login.id_token;
      
    // socket.on('connect', function () {
    //     console.log("connect");
    //   });
      
      
    socket.on('connect', function (msg) {
      console.log("connected");
      socket.emit('authenticate', {token: id_token}); // send the jwt
      
    })
    .on('authenticated', function () {
      console.log("authenticated")
      // self.getkeys=function(){socket.emit('getkeys');};
      socket.on('getkeys', function (keys) {
          if(!(self.loaded))self.parent.loadApp(keys);
      });
      socket.on('getdatasets', function (obj) {
        let list=obj.data;
        list.forEach(item=>{
          if(item.name ===self.parent.table)item.checked=true;
        });
        self.parent.tables=list;
        self.parent.loadMapD();
      });
      socket.emit('getkeys');
    })
    .on('unauthorized', function(msg){
      console.log("unauthorized: " + JSON.stringify(msg.data));
      throw new Error(msg.data.type);
    })

    // self.func1=function(){return console.log("func2")}
    
    
  },
}