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
function extend(dest, src) {
    for (var i in src) dest[i] = src[i];
    return dest;
}


function getHostName(url) {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
    return match[2];
    }
    else {
        return null;
    }
}
const options ={
  debug:true,
  language:'en',
  
  IP :getHostName(window.location.href),
  // URL : 'http://' + getHostName(window.location.href) + '/',
}