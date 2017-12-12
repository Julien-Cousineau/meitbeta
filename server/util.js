exports.checkMemory = function checkMemory(){
  const used = process.memoryUsage();
  for (let key in used) {
    console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
};
exports.extend = function (dest, src) {
    for (var i in src) dest[i] = src[i];
    return dest;
};

exports.range=function(n){
  return Array.from(new Array(n), (x,i) => i);
}