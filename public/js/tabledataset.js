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
        datecreated:{title:"Date Uploaded",data:''},
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
    this.parent.socket.emit("getdatasets");
  },
  htmlDataset:function(full){
    return '<button type="button" class="btn-circle btn-primary"><span><i class="fa fa-plus" aria-hidden="true"></i></span></button>';
  },
  htmlDatasetAction:function(id,className){
    const self = this;
    $('#{0} tbody'.format(id)).on('click', 'td.{0} button'.format(className), function () {
      var tr = $(this).closest('tr');      
      var row = self.base.datatable.row( tr );
      var obj = row.data();
      var rowid = row[0][0];
      $(this).children("button").children("i").toggleClass("fa-plus fa-minus")
      if ( row.child.isShown() ) {
        row.child.hide();
        tr.removeClass('shown');
      } else {        
        row.child(self.htmlDatasetDetail(rowid,row.data()) ).show();
        tr.addClass('shown');
      }
    
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
      true:function(){self.parent.socket.emit('deletedataset',row.data())},
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
    let html =`<button type="button" class="btn btn-warning">New Dataset</button>
               `;
    $("#{0}_wrapper .uploadcontainer".format(id)).empty().append(html);
    $("#{0}_wrapper .uploadcontainer button".format(id)).on("click",function(){self.htmlAddButtonAction();});
  },
  htmlAddButtonAction:function(id){
    const self=this;
    this.parent.socket.emit("newdataset")
  },  
};
