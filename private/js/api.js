/*global $,extend,Table,getprogressbar*/
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
  uploadFiles:function(id,container,callback){
    const self=this;
    
    $('{0}'.format(id)).dmUploader({
        dataType: 'csv',
        url: '/upload',
        onBeforeUpload: function(id){
          $("{0}".format(container)).empty().append(getprogressbar("uploadprogress"));
        },
        onComplete: function (e, data) {
          console.log('upload successful!\n' + data);
          callback(false)
        },
        onUploadProgress: function (e, percentComplete) {
          // console.log(percentComplete)
          // var progress = parseInt(data.loaded / data.total * 100, 10);
          // var percentComplete = evt.loaded / evt.total;
          // var    percentComplete = parseInt(data.loaded / data.total * 100, 10);
  
              // update the Bootstrap progress bar with the new percentage
              $('{0} .progress.bar .uploadprogress'.format(container)).text(percentComplete + '%');
              $('{0} .progress.bar .uploadprogress'.format(container)).width(percentComplete + '%');
  
              // once the upload reaches 100%, set the progress bar text to done
              if (percentComplete === 100) {
                $('{0} .progress.bar .uploadprogress'.format(container)).html('Done');
              }
        }
    });
  },
  uploadFiless:function(id,container,callback){
    const self=this;
    $('{0}'.format(id)).on('change', function(){
      $("{0}".format(container)).empty().append(getprogressbar("uploadprogress"));
      var files = $(this).get(0).files;
      if (files.length > 0){
        var formData = new FormData();
    
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          formData.append('uploads[]', file, file.name);
        }
      }
      $.ajax({
        url: '/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data){
          console.log('upload successful!\n' + data);
          callback(false)
            // self.addUploadButton();
            // self.getFileList();
            
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
              $('{0} .progress.bar .uploadprogress'.format(container)).text(percentComplete + '%');
              $('{0} .progress.bar .uploadprogress'.format(container)).width(percentComplete + '%');
  
              // once the upload reaches 100%, set the progress bar text to done
              if (percentComplete === 100) {
                $('{0} .progress.bar .uploadprogress'.format(container)).html('Done');
              }
  
            }
  
          }, false);
          return xhr;
        }
      });
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