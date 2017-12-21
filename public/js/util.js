
function extend(dest, src) {
    for (var i in src) dest[i] = src[i];
    return dest;
}
var inheritsFrom = function (child, parent) {
    child.prototype = Object.create(parent.prototype);
};
// var extendObj = function(childObj, parentObj) {
//     childObj.prototype = parentObj.prototype;
// };

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function getprogressbar(id){
    return `
            <div class="progress bar">
              <div class="progress-bar progress-bar-success {0}" role="progressbar" aria-valuenow="0"
              aria-valuemin="0" aria-valuemax="100" style="width:0%">
                0% Complete
              </div>
            </div>
            <div class="progresstext {0}"></div>
            `.format(id);
}

function range(n){
  return Array.from(new Array(n), (x,i) => i);
}

// String formatter
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}