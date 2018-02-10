/*global $,extend,BaseTable,inheritsFrom,getprogressbar*/
function DatesetTable(parent){
  this._parent = parent;
  const self=this;
  this.pointer = function(){return self;};
  this.base = new BaseTable(this.pointer);
  this.data = null;
  
  this.construct();
  
}
// FileTable.prototype = new BaseTable();
DatesetTable.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get socket(){return this.parent.Socket.socket;},
  construct:function(){
    const self = this;
    this.options=
    {
      container:".datasetplaceholder",
      id:'dataset',
      apiFuncName:'getdatasets',
      actionbuttons:function(id){return self.htmlAddButton(id);},
      columns:{
        name:{title:"Dateset name",data:""},
        // datecreated:{title:"Date Uploaded",data:''},
        public:{title:"Public?",
                className:'publicAtt',
                render:function(full){return self.htmlPublicDataset(full);},
                action:function(id,className){return self.htmlPublicAction(id,className);}
        },
        default:{title:"Default",
                className:'defaultAtt',
                render:function(full){return self.htmlDefault(full);},
                action:function(id,className){return self.htmlDefaultAction(id,className);}
        },
        childids:{title:"Data",
               className:"dataAtt",
               render:function(full){return self.htmlDataset(full);},
               action:function(id,className){return self.htmlDatasetAction(id,className);}
        },
        delete:{title:"",
                type:"delete",
                className:"rowdelete",
                render:function(full){return self.htmlRowDelete(full);},
                action:function(id,className){return self.htmlRowDeleteAction(id,className);}
               }
        },
      data:function(){return self.data;}
    };
    this.base.apiFunc();
    this.socket.emit("getdatasets");
  },
  htmlPublicDataset:function(full){
    return (full.public)?'<button type="button" class="btn-none"><span><i class="fas fa-check-circle fa-2x" aria-hidden="true"></i></span></button>':
                          '<button type="button" class="btn-none"><span><i class="far fa-circle fa-2x checktable" aria-hidden="true"></i></span></button>';
  },  
  htmlDataset:function(full){
    return '<button type="button" class="btn-circle btn-primary"><span><i class="fa fa-plus" aria-hidden="true"></i></span></button>';
  },
  htmlDefault:function(full){
    return (full.default)?'<span><i class="fas fa-check-circle fa-2x" aria-hidden="true"></i></span>':
                          '<button type="button" class="btn-none"><span><i class="far fa-circle fa-2x checktable" aria-hidden="true"></i></span></button>';
  },
  htmlDatasetAction:function(id,className){
    const self = this;
    $('#{0} tbody'.format(id)).on('click', 'td.{0} button'.format(className), function () {
      var tr = $(this).closest('tr');      
      var row = self.base.datatable.row( tr );
      var obj = row.data();
      var rowid = row[0][0];
      $('.panelleft').css("margin-left","-49%");
      self.socket.emit("getview",obj);
    });
    
  },
  htmlDefaultAction :function(id,className){
    const self = this;
    $('#{0} tbody'.format(id)).on('click', 'td.{0} button'.format(className), function () {
      var tr = $(this).closest('tr');      
      var row = self.base.datatable.row( tr );
      var obj = row.data();
      self.socket.emit("changedefaultdataset",obj);
    });
  },
  htmlPublicAction :function(id,className){
    const self = this;
    $('#{0} tbody'.format(id)).on('click', 'td.{0} button'.format(className), function () {
      var tr = $(this).closest('tr');      
      var row = self.base.datatable.row( tr );
      var obj = row.data();
      self.socket.emit("changepublicdataset",obj);
    });
  },  
  htmlDatasetDetail:function(rowid,data){
      return  `
    <div class="deletecontainer" rowid={0}>
      <h5>Are you sure?</h5>
      <button type="button" class="btn btn-primary" con="true">Yes</button>
      <button type="button" class="btn btn-primary" con="false">No</button>
    </div>`.format(rowid);
      
  },
  htmlRowDelete:function(full){
    return `<button type="button" class="btn btn-danger" con="main">Delete</button>`;
  },
  htmlRowDeleteAction:function(id,className){
    const self = this;
    $('#{0} tbody'.format(id)).on('click', 'td.{0} button[con="main"]'.format(className), function () {
      var tr = $(this).closest('tr');      
      var row = self.base.datatable.row( tr );
      var rowid = row[0][0];
      row.child(self.htmlRowDeleteDetail(rowid)).show();
      tr.addClass('shown');
      self.htmlRowDeleteDetailAction(id,row,rowid,tr,'true');
      self.htmlRowDeleteDetailAction(id,row,rowid,tr,'false');
    });
  },
  htmlRowDeleteDetail:function(rowid){
    return  `
    <div class="deletecontainer" rowid={0}>
      <h5>Are you sure?</h5>
      <button type="button" class="btn btn-primary" con="true">Yes</button>
      <button type="button" class="btn btn-primary" con="false">No</button>
    </div>`.format(rowid);    
  },
  htmlRowDeleteDetailAction:function(id,row,rowid,tr,con){
    const self=this;
    // if(id==='filetable')truefunction=;
    // if(id==='datasettable')truefunction=function(){self.parent.socket.emit('deletedataset',row.data())};
    const conF={
      true:function(){self.socket.emit('deletedataset',row.data())},
      false:function(){return;}
    };
    
    $('#{0} tbody'.format(id)).on('click', 'div[rowid={0}] button[con="{1}"]'.format(rowid,con), function (e) {
      conF[con]();
      $('#{0} tbody'.format(id)).off('click', 'div[rowid={0}] button[con="true"]'.format(rowid));
      $('#{0} tbody'.format(id)).off('click', 'div[rowid={0}] button[con="false"]'.format(rowid));
      row.child.remove();
      tr.removeClass('shown');
    });    
  },
  htmlAddButton:function(id){
    const self=this;
    // let html =`<button type="button" class="btn btn-warning">New Dataset</button>`;
    let html =`
    <div class="row">
      <div class="col-sm-8">
        <input type="text" class="form-control form-control-sm" id="newdatasetinput" placeholder="name of table">
        <div class="invalid-feedback">
          Name already exist.
        </div>
      </div>
      <div class="col-sm-4">
        <button class="btn btn-primary">New</button>
      </div>
    </div>
          `;
    $("#{0}_wrapper .uploadcontainer".format(id)).empty().append(html);
    $("#{0}_wrapper .uploadcontainer button".format(id)).on("click",function(){self.htmlAddButtonAction(id);});
    this.socket.on("newdataseterror", function(msg){
      $("#{0}_wrapper .uploadcontainer input".format(id)).addClass("is-invalid")
    });
    
    
  },
  htmlAddButtonAction:function(id){
    const self=this;
    let value=$("#{0}_wrapper .uploadcontainer input".format(id)).val();
    this.socket.emit("newdataset",value);
  },  
};
