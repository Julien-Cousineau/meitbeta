/*global $,extend,BaseTable,inheritsFrom,getprogressbar*/
function DatesetFileTable(parent){
  this._parent = parent;
  const self=this;
  this.pointer = function(){return self;};
  this.base = new BaseTable(this.pointer);
  this.data = null;
  this.construct();
  
}
// FileTable.prototype = new BaseTable();
DatesetFileTable.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  
  get dataset(){return this.meta.dataset},
  construct:function(){
    const self = this;
    this.options=
    {
      container:".datasetfileplaceholder",
      id:'datasetfile',
      apiFuncName:'getview',
      actionbuttons:function(id){return self.htmlBackButton(id);},
      columns:{
        name:{title:"CSV Files",data:""},
        datecreated:{title:"Date Uploaded",data:''},
        inside:{title:"Add File to Dataset",
               className:"addfile",
               render:function(full){return self.htmlConvert(full);},
               action:function(id,className){return self.htmlConvertAction(id,className);}
               },
      },
      data:function(){return self.data;}
    };
    this.base.apiFunc();
  },
  htmlConvert:function(full){
    const falsehtml = `<button type="button" class="btn btn-primary">Add</button>`;
    const truehtml = `<span><i class="fa fa-check-circle fa-2x successicon" aria-hidden="true"></i></span>`;

    return (full.inside)?truehtml:falsehtml;    
  },
  htmlConvertAction:function(id,className){
    const self = this;
    $('#{0} tbody'.format(id)).on('click', 'td.{0} button'.format(className), function () {
      var tr = $(this).closest('tr');      
      var row = self.base.datatable.row( tr );
      var obj = row.data();
      obj.htmlid = obj.name.replace(/\./g,'');
      obj.dataset = self.dataset;
      self.parent.socket.emit('addfiledataset',obj);
      $(this).parent().empty().append(getprogressbar(obj.htmlid));
    });
    self.parent.socket.on('addfiledataset', function(meta){
      if(meta.action==="done"){
        const html = `<span><i class="fa fa-check-circle fa-2x successicon" aria-hidden="true"></i></span>`;
        $('.progress.bar'.format(meta.htmlid)).parent().empty().append(html);
      } else {
        $('.progress.bar .{0}'.format(meta.htmlid)).css('width', meta.progress+'%').attr('aria-valuenow', meta.progress).text('{0}% Complete'.format(parseInt(meta.progress+1)));;
        $('.progresstext.{0}'.format(meta.htmlid)).text(meta.action);
      }
    });
    
  },
  htmlBackButton:function(id){
    const self=this;
    // let html =`<button type="button" class="btn btn-warning">New Dataset</button>`;
    let html =`
    <button type="button" class="btn-circle btn-primary"><span><i class="fa fa-chevron-left" aria-hidden="true"></i></span></button>
          `;
    $("#{0}_wrapper .refreshcontainer".format(id)).empty().append(html);
    $("#{0}_wrapper .refreshcontainer button".format(id)).on("click",function(){self.htmlBackButtonAction(id);});
  },
  htmlBackButtonAction:function(id){
    $('.panelleft').css("margin-left","0%");
  },
};
