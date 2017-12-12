/*global $,extend,BaseTable,inheritsFrom,getprogressbar*/
function FileTable(parent){
  this._parent = parent;
  const self=this;
  this.pointer = function(){return self;};
  this.base = new BaseTable(this.pointer);
  this.data = null;
  this.construct();
  
}

// FileTable.prototype = new BaseTable();
FileTable.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  construct:function(){
    const self = this;
    this.options=
    {
      container:".tableplaceholder",
      id:'file',
      apiFuncName:'getfiles',
      actionbuttons:function(id){return self.htmlUploadButton(id);},
      columns:{
        name:{title:"CSV Files",data:""},
        childid:{title:"Ready for Database",
               className:"tableConvert",
               render:function(full){return self.htmlConvert(full);},
               action:function(id,className){return self.htmlConvertAction(id,className);}
        },
        size:{title:"Size",data:''},
        datecreated:{title:"Date Uploaded",data:''},
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
    this.parent.socket.emit("getfiles");
  },

  htmlConvert:function(full){
    const falsehtml = `<button type="button" class="btn btn-primary">Convert</button>`;
    const truehtml = `<span><i class="fa fa-check-circle fa-2x successicon" aria-hidden="true"></i></span>`;
    return (full.childid)?truehtml:falsehtml;    
  },
  htmlConvertAction:function(id,className){
    const self = this;
    $('#{0} tbody'.format(id)).on('click', 'td.{0} button'.format(className), function () {
      var tr = $(this).closest('tr');      
      var row = self.base.datatable.row( tr );
      var obj = row.data();
      obj.htmlid = 'myid';
      self.parent.socket.emit('convertcsv',obj);
      $(this).parent().empty().append(getprogressbar('myid'));
    });
    self.parent.socket.on('convertcsv', function(meta){
      if(meta.action==="done"){
        const html = `<span><i class="fa fa-check-circle fa-2x successicon" aria-hidden="true"></i></span>`;
        $('.progress.bar'.format(meta.htmlid)).parent().empty().append(html);
      } else {
        $('.progress.bar .{0}'.format(meta.htmlid)).css('width', meta.progress+'%').attr('aria-valuenow', meta.progress).text('{0}% Complete'.format(parseInt(meta.progress+1)));;
        $('.progresstext.{0}'.format(meta.htmlid)).text(meta.action);
      }
    });
    
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
      true:function(){self.parent.socket.emit('deletefile',row.data())},
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
  htmlUploadButton:function(id){
    let html =`<button type="button" class="btn btn-warning">Upload File</button>
               <input id="upload-input" type="file" name="uploads[]" multiple="multiple"></br>`;
    $("#{0}_wrapper .uploadcontainer".format(id)).empty().append(html);
    $("#{0}_wrapper .uploadcontainer button".format(id)).on("click",function(){$('#upload-input').click();});
    this.htmlUploadButtonAction(id);
  },
  htmlUploadButtonAction:function(id){
    const self=this;
    this.parent.api.uploadFiles('#upload-input','.uploadcontainer',function(){
      self.htmlUploadButton(id);
      self.parent.socket.emit("getfiles");
    });
  },  
};
