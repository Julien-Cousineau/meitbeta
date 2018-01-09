importScripts("https://d3js.org/d3-array.v1.min.js");
importScripts("https://d3js.org/d3-collection.v1.min.js");
importScripts("https://d3js.org/d3-color.v1.min.js");
importScripts("https://d3js.org/d3-format.v1.min.js");
importScripts("https://d3js.org/d3-interpolate.v1.min.js");
importScripts("https://d3js.org/d3-scale.v1.min.js");

const xscale= d3.scaleLog()
            .domain([1, 100000000])
            .range(['rgba(255, 255, 255, 0)', 'rgba(239, 59, 54, 0.7)']);

onmessage = (obj) => {
  const cache={};
  const data=obj.data.data;
  const emission=obj.data.emission;
  let stops=[];
  for(let i=0,n=data.length;i<n;i++){
    const item=data[i];
    cache[item.key0]={};
    cache[item.key0].value=item[emission];  
    cache[item.key0].color=xscale(item[emission]);
    stops.push([parseInt(item.key0),cache[item.key0].color]);
  }
  postMessage({type:"end",data:{cache:cache,stops:stops}});
}
