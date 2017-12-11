/*global $,extend,Table*/
function Api(){
    
}
Api.prototype = {
  getFileList:function(callback){
    $.ajax({
      url: '/uploadList',
      type: 'POST',
      processData: false,
      success: function(data){
        callback(JSON.parse(data));
      },
      error:function(e,message){
        console.log(message);
        callback([]);
      }
      
    });
    
  },
  getSomthing:function(){
    $.ajax({
      url: '/convert',
      type: 'POST',
      processData: false,
      contentType: false,
      success: function(data){
          console.log('convert successful!\n');
      },
      xhr: function() {
        // create an XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // listen to the 'progress' event
        xhr.upload.addEventListener('progress', function(evt) {

          if (evt.lengthComputable) {
            // calculate the percentage of upload completed
            var percentComplete = evt.loaded / evt.total;
            percentComplete = parseInt(percentComplete * 100);

            // update the Bootstrap progress bar with the new percentage
            $('.progress-bar').text(percentComplete + '%');
            $('.progress-bar').width(percentComplete + '%');

            // once the upload reaches 100%, set the progress bar text to done
            if (percentComplete === 100) {
              $('.progress-bar').html('Done');
            }

          }

        }, false);

        return xhr;
      }
    });
  }
}