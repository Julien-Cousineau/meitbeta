
function Prop(name,type,n,offset){
  this.name =name;
  this.type =type;
  this.n =n;
  this.props=[];
  this.offset=(offset)?offset:0;
}
Prop.prototype ={
  newProp:function(name,type,n){
    const offset = this.offset;
    this.props.push(new Prop(name,type,n,offset));
    this.offset += n;
  },
  new:function(buffer){
    if(this.type==="int8")return buffer.readUInt8(this.offset);
    if(this.type==="int16")return buffer.readUInt16BE(this.offset);
    if(this.type==="int32")return buffer.readUInt32BE(this.offset);
    if(this.type==="float")return buffer.readFloatBE(this.offset);
  },
  write:function(buffer,value){
    if(this.type==="int8")buffer.writeUInt8(value,this.offset);
    if(this.type==="int16")buffer.writeUInt16BE(value,this.offset);
    if(this.type==="int32")buffer.writeUInt32BE(value,this.offset);
    if(this.type==="float")buffer.writeFloatBE(value,this.offset);
  },
  
  newArray:function(number){
    if(this.type==="int8")return new Uint8Array(number);
    if(this.type==="int16")return new Uint16Array(number);
    if(this.type==="int32")return new Uint32Array(number);
    if(this.type==="float")return new Float32Array(number);
  },
  alloc:function(){
    if(!(this._alloc)){
      this._alloc=this.props.map(prop=>prop.n).reduce((acc,cur) =>{return acc+cur});
    }
    return this._alloc;
  },
  newBuffer:function(){
    return new Buffer.alloc(this.alloc());
  }
};

module.exports = Prop;