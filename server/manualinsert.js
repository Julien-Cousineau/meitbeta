const path = require('path');
const DataServer = require('./dataserver');
const UPLOADFOLDER =  path.join(__dirname, '../data/upload');


function ManualInsert(){
    const self=this;
    this.pointer = function(){return self;};
    const dataserver = new DataServer(this.pointer,{web:false});
    const filepath = path.resolve(UPLOADFOLDER,"arcticWIG_09212017.csv")
    dataserver.insert(filepath,function(){
        console.log("Done")
    })
}

new ManualInsert();