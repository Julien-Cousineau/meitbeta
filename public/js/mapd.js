

function MapD(parent){
  this._parent = parent;
  this.construct()
    
}
MapD.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  construct:function(){
    const self=this;
    this.con=new MapdCon()
    .protocol("http")
    .host("52.242.33.125")
    .port("9092")
    .dbName("mapd")
    .user("mapd")
    .password("HyperInteractive")
    .connect(function(error, con) {
      /*
       *  This instaniates a new crossfilter.
       *  Pass in mapdcon as the first argument to crossfilter, then the
       *  table name, then a label for the data (unused in this example).
       *
       *  to see all availables --  con.getTables()
       */
       crossfilter.crossfilter(con, "table3").then(self.createCharts)
      /*
       *  Pass instance of crossfilter into our reateCharts.
       */
    });
  },
  createCharts:function(crossFilter){
    // var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 50
    // var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 200
    var colorScheme = ["#22A7F0", "#3ad6cd", "#d4e666"];
    var allColumns = crossFilter.getColumns();
    
    var countGroup = crossFilter.groupAll();
    var countWidget = dc.countWidget(".data-count")
      .dimension(crossFilter)
      .group(countGroup);
    
    var rowChartDimension = crossFilter.dimension("class");
    var rowChartGroup = rowChartDimension.group().reduceCount();
    var dcBarChart =  dc.rowChart('.chart1-example')
                .height(300)
                .width(300)
                .elasticX(true)
                .cap(20)
                .othersGrouper(false)
                .ordinalColors(colorScheme)
                .measureLabelsOn(true)
                .dimension(rowChartDimension)
                .group(rowChartGroup)
                .autoScroll(true);
    
    var reduceF = [
         {
           expression: "nox",
           agg_mode:"sum",
           name: "nox"
         }
       ];
    var rowChartDimension2 = crossFilter.dimension("type");
    var rowChartGroup2 = rowChartDimension2.group().reduce(reduceF);
    
    var dcBarChart2 =  dc.rowChart('.chart2-example')
                .height(300)
                .width(300)
                .elasticX(true)
                .cap(20)
                .othersGrouper(false)
                .ordinalColors(colorScheme)
                .measureLabelsOn(true)
                .dimension(rowChartDimension2)
                .group(rowChartGroup2)
                .valueAccessor(function (p) {return p.nox;})
                .autoScroll(true);    
    
    var reduceF2 =
      [{
        expression: "datet",
        agg_mode:"min",
        name: "minimum"
      },
      {
        expression: "datet",
        agg_mode:"max",
        name: "maximum"}
      ];
    crossFilter
        .groupAll()
        .reduceMulti(reduceF2)
        .valuesAsync(true).then(function(timeChartBounds) {

          var timeChartDimension = crossFilter.dimension("datet");
          var timeChartGroup = timeChartDimension.group()
                                                 .reduceCount()

          var dcTimeChart = dc.barChart('.chart3-example')
            .width(300)
            .height(300)
            .elasticY(true)
            .renderHorizontalGridLines(true)
            .brushOn(true)
            .xAxisLabel('Time')
            .yAxisLabel('# Pings')
            .dimension(timeChartDimension)
            .group(timeChartGroup)
            .binParams({
               numBins: 400,
               binBounds: [timeChartBounds.minimum,timeChartBounds.maximum]
              });

          /* Set the x and y axis formatting with standard d3 functions */
          console.log()
          const min = new Date(timeChartBounds.minimum)
          const max = new Date(timeChartBounds.maximum)
          console.log(min,max)
          console.log(timeChartBounds.minimum)
          dcTimeChart
            .x(d3.time.scale.utc().domain([min,max]))
            .yAxis().ticks(5);

          dcTimeChart
            .xAxis()
            .scale(dcTimeChart.x())
            .tickFormat(dc.utils.customTimeFormat)
            .orient('top');

          /* Calling dc.renderAllAsync() will render all of the charts we set up.  Any
           * filters applied by the user (via clicking the bar chart, scatter plot or dragging the time brush) will automagically call redraw on the charts without any intervention from us
           */

          dc.renderAllAsync()
      
        });
    
    
    
    // dc.renderAllAsync();            
  },
};