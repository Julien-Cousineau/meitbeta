/*global $,extend*/
function Table(parent,options){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
  this.construct();    
}
Table.prototype = {
  options:{
    container:"",
    id:"",
    columns:{file:{title:"File",type:'string'},size:{title:"Size",type:'string'},created:{title:"Created",type:'string'}},
    data:function(){return [];}
  },
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get container(){return this.options.container},
  get id(){return this.options.id},
  get columns(){return this.options.columns},
  set columns(value){this.options.columns=value;},
  get data(){return this.options.data();},
  construct:function(){
    const self=this;
    const container = this.container;
    const id = this.id;
    
    const data = this.data;
    console.log(data)
    $("{0}".format(container)).append(this.getDivTable(id));
    console.log($("{0}".format(container)))
    $("#{0}".format(id)).append(this.getDivHeader(this.columns));
    this.datatable = $("#{0}".format(id)).DataTable( {
                    "dom":"<'row'<'col-sm-4 refreshcontainer'><'col-sm-4'l><'col-sm-4'f>>".format(id) + 
                          "<'row'<'col-sm-12'tr>>" + 
                          "<'row'<'col-sm-4 uploadcontainer'><'col-sm-4'i><'col-sm-4'p>>",
                    // "scrollX": true,
                    // scrollY:'70vh',
                    autoWidth: true,
                    "order": [[ 1, 'asc' ]],
                    // scrollCollapse: true,
                    data: data,
                    columns: this.getKeys(),
                    "drawCallback": function( row, data, index ) {self.addTableFunc();},
                });
    
  },
  getKeys:function(){
    const columns = this.columns;
    const array=[];
    for(let key in columns){
      const obj=columns[key];
      if(obj.type==="string"){array.push({data:key});}
      else{
        array.push({"className":obj.className,
                       "orderable":false,
                       "data":null,
                       "render":function (data,type,full,meta){return obj.render(full)}});
        if(obj.action)obj.action(this.id,obj.className);
      }
    }
    return array;
  },
  addTableFunc:function(){
    $('#{0} tbody'.format(this.id)).off(); // Remove all event listeners, if not duplicates will exist
    const columns = this.columns;
    for(let key in columns){
      const obj=columns[key];
      if(obj.action)obj.action(this.id,obj.className);
    }
    this.addRefreshButton();
    this.parent.addUploadButton();
  },
  addRefreshButton:function(){
    const self=this;
    let html =`<button type="button" class="btn btn-secondary"><span><i class="fa fa-refresh" aria-hidden="true"></i></span>Refresh</button>`;
    $(".refreshcontainer").empty().append(html);
    $(".refreshcontainer button").on("click",function(){self.parent.getFileList();});
  },
  
  update:function(){
    this.datatable.clear();
    this.datatable.rows.add(this.data);
    this.datatable.draw();
  },
  getDivTable:function(id){
    return `<div class="mycontent"> 
              <table id="{0}" class="table table-striped table-bordered" cellspacing="0" width="100%"></table>
            </div>`.format(id);    
  },  
  getDivHeader:function(columns){
    let ths='';
    for(let key in columns){
      ths+='<th>{0}</th>'.format(columns[key].title);
    }
    return '<thead><tr>{0}</tr></thead>'.format(ths);
  },
}