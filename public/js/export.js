/*global saveAs Blob,XLSX,g_emissionOutputs*/
function Workbook() {
	if(!(this instanceof Workbook)) return new Workbook();
	this.SheetNames = [];
	this.Sheets = {};
}

function s2ab(s) {
	var buf = new ArrayBuffer(s.length);
	var view = new Uint8Array(buf);
	for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
	return buf;
}

/*global extend,dc */

function ExportC(parent,options){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
  this.construct();
}

ExportC.prototype = {
  options:{
  },
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get emission(){return this.parent.emission;},
  get unit(){return this.parent.unit},
  get filters(){return this.parent.mapd.filters},
  construct:function(){
    const wb = this.wb = new Workbook();
  },
  export:function(){
    const self=this;
    this.getSummarySheet();
    this.getEmissionSheets(function(){
      let wbout = XLSX.write(self.wb, {bookType:'xlsx', bookSST:true, type: 'binary'});
      saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), "test.xlsx");
    });
    
  },
  getSummarySheet:function(){
    
   
    let table = [];
  
    table.push(["Units",this.unit]);
    table.push(["Filters"]);
    
    const charts = this.parent.charts;
    const language = this.parent.language;
    charts.forEach(chart=>{
      const keyword = chart.keyword;
      const name = this.parent.keywords[keyword][language];
      const filters = chart.dc.dc.filters();
      if(!(filters.length)){table.push([name,"None"])}
      else{
        table.push([name].concat(filters));
      }
      // console.log(table);
    });
    console.log(table)
    const sheetname = "filters";
    this.wb.SheetNames.push(sheetname);
    this.wb.Sheets[sheetname] = XLSX.utils.aoa_to_sheet(table);
  },
  getEmissionSheets:function(callback){
    const self=this;
    const charts = this.parent.charts;
    const wb = this.wb;
    const divider = this.parent.divider;
    const emissions = this.parent.emissions;
    const language = this.parent.language;
    let header = [''].concat(emissions.map(function(emission){return emission.name;}));
    
    this.parent.mapd.export(function(err,data){
      // console.log(data)
      
      charts.forEach((chart,i)=>{
        const cdata=data[i];
        // console.log(cdata)
        let table=[];
        table.push(header);
        const keys=cdata[0].map(item=>item.key0);
        
        // console.log(keys.length,emissions.length)
        for(let irow=0,nrow=keys.length;irow<nrow;irow++){
          let row=[];
          for(let ie=0,ne=emissions.length;ie<ne;ie++){
            let value = cdata[ie][irow][emissions[ie].name]/divider;
            row.push(value);
          }
          table.push([keys[irow]].concat(row))
        }
        // console.log(table)
        // console.log(data[i])
        let sheetname = chart.keyword;
        wb.SheetNames.push(sheetname);
        wb.Sheets[sheetname] = XLSX.utils.aoa_to_sheet(table);
      });
      callback();
    });
   
    // charts.forEach(chart=>{
    //   const keyword = chart.keyword;
    //   const sheetname = this.parent.keywords[keyword][language];
    // },this);
    
  },
  

}
function g_exportxls(mf){
  
  var filters = mf.filters;
  var data= mf.data;
  var dname = mf.dname;
  var divider = mf.divider;
  
  var wb = new Workbook()
  var sheetname = "filters" 
  var test = []
  
  test.push(["Units",dname]);
  test.push(["Filters"])
  
  if($.isEmptyObject(filters)) {
    test.push(["None"]);
  } else {
     console.log(filters)
    // var ttest = {
    //                 "ship_class":["merchant bulk","tanker"]
    //               }
      Object.keys(filters).forEach(function(key) {
        var row = [key].concat(filters[key]);
        test.push(row);
      });
    
  }
  

  wb.SheetNames.push(sheetname);
  wb.Sheets[sheetname] = XLSX.utils.aoa_to_sheet(test);
  
  
  data.forEach(function(chart){
    if(chart.header !=='total'){
      var sheetname = chart.header;
      var _filters = filters[sheetname];
      if(_filters){
        if(!Array.isArray(_filters)){_filters = [_filters];}
      }
      var groups = chart.values;
      var header = [''].concat(g_emissionOutputs.map(function(row){return row.dname;}));
      var keys = g_emissionOutputs.map(function(row){return row.name;});
      var table=[header];
      for(var i=0;i<groups.length;i++){
       
          
          
 
          var group=groups[i];
          var row=[];
          row.push(group.key);
          var value =group.value;

            
          for(var j=0;j<keys.length;j++){
            var key=keys[j];
            if(_filters){
              if($.inArray(group.key,_filters)!==-1){
                row.push(formatOutputEmission(value[key]/divider));
              } else{
                row.push(formatOutputEmission(0));
              }
            } else {
              row.push(formatOutputEmission(value[key]/divider));
            }
          }
          table.push(row);
      }
      groups.forEach(function (group){
      });
      wb.SheetNames.push(sheetname);
      wb.Sheets[sheetname] = XLSX.utils.aoa_to_sheet(table);
      
    }
  });
  
  var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});
 
  saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), "test.xlsx");
}