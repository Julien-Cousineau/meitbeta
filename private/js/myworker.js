importScripts("https://d3js.org/d3-array.v1.min.js");
importScripts("https://d3js.org/d3-collection.v1.min.js");
importScripts("https://d3js.org/d3-color.v1.min.js");
importScripts("https://d3js.org/d3-format.v1.min.js");
importScripts("https://d3js.org/d3-interpolate.v1.min.js");
importScripts("https://d3js.org/d3-scale.v1.min.js");

const xscale= d3.scaleLinear()
            .domain([1E6,1E7,1E8,1E9,1E10,1E11,1E12,1E13])
            .range(['#3288bd','#66c2a5','#abdda4','#e6f598','#fee08b','#fdae61','#f46d43','#d53e4f']);

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
