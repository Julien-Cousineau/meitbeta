/*global $,extend*/

function BaseTable(parent){
  this._parent = parent;
  
  // this.options = extend(Object.create(this.options), options);
  // this.construct();    
}
BaseTable.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  // options:{
  //   container:"",
  //   id:"",
  //   newactionbutton:function(){return null;},
  //   columns:{file:{title:"File",type:'string'},size:{title:"Size",type:'string'},created:{title:"Created",type:'string'}},
  //   data:function(){return [];}
  // },
  get socket(){return this.parent.socket;},
  get container(){return this.parent.options.container},
  get id(){return this.parent.options.id},
  get columns(){return this.parent.options.columns},
  set columns(value){this.parent.options.columns=value;},
  get meta(){return this.parent.meta;},
  set meta(value){this.parent.meta=value;},
  get data(){return this.parent.data;},
  set data(value){this.parent.data=value;},
  apiFunc:function(){
    const self=this;
    this.socket.on(self.parent.options.apiFuncName, function(obj){
      const list = obj.data;
      const meta = obj.meta;
      console.log(list)
        if(self.data){
          self.data= list;
          self.meta = meta;
          self.update();  
        } else {
          self.data= list;
          self.meta = meta;
          self.build();
        }
    });
  },
  build:function(){
    const self=this;
    const container = this.container;
    const id = this.id;
    const data = this.data;
    
    
    $("{0}".format(container)).append(this.getDivTable(id));
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
  // getKeys:function(){
  //   const columns = this.columns;
  //   const array=[];
  //   for(let key in columns){
  //     const obj=columns[key];
  //     if(obj.type==="string"){array.push({data:key});}
  //     else{
  //       array.push({"className":obj.className,
  //                     "orderable":false,
  //                     "data":null,
  //                     "render":function (data,type,full,meta){return obj.render(full)}});
  //       if(obj.action)obj.action(this.id,obj.className);
  //     }
  //   }
  //   return array;
  // },
  getKeys:function(){
    const columns = this.columns;
    const array=[];
    
    for(let key in columns){
      const obj=columns[key];
      array.push({"className":(obj.className) ? obj.className:null,
                  "orderable":(obj.orderable) ? obj.orderable:null,
                  "data":(obj.data) ? key:null,
                  "render":(obj.render) ? function (data,type,full,meta){return obj.render(full)}:key,
                 });
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
    if(this.parent.options.actionbuttons)this.parent.options.actionbuttons(this.id);
    // this.parent.addUploadButton();
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

