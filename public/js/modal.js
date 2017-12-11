/*global $,extend,Table*/
function Modal(parent,options){
  this._parent = parent;
  const self = this;
  this.pointer = function(){return self;};
  this.options = extend(Object.create(this.options), options);
  this.tables ={};
  this.construct();
}
Modal.prototype ={
  get container(){return this.options.container;},
  get name(){return this.options.name},
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  options:{container:"",
           name:"upload",
           filelist:[]
    
  },
  construct:function(){
    if(this.parent.debug)console.log("Constructing Modal")
    this.render();
    this.getFileList();
  },
  get filelist(){return this._filelist;},
  set filelist(value){this._filelist= value;},
  getFileList(){
    const self=this;
    this.parent.api.getFileList(function(value){
      self.filelist= value;
      if(self.tables['file']){
        self.tables['file'].update();  
      } else {
        self.buildFileTable();
      }
      
    });
    
  },
  render:function(){
    $(this.container).append(this.renderhtml);
    // $('body').append(this.defaultdropzone());
    // this.setDropzone();
    this.constructFunc();
  },
  uploadFile:function(){
    // const html = `<input id="upload-input" type="file" name="uploads[]" multiple="multiple"></br>`;
    
    // $(".uploadcontainer").append(html);
    // this.setDropzone();
    $('#upload-input').click();
    
  },
  addUploadButton:function(){
    const self=this;
    let html =`<button type="button" class="btn btn-warning">Upload File</button>
               <input id="upload-input" type="file" name="uploads[]" multiple="multiple"></br>`;
    $(".uploadcontainer").empty().append(html);
    $(".uploadcontainer button").on("click",function(){self.uploadFile();});
    this.setDropzone();
  },  
  setDropzone:function(){
    // $('.upload-btn').on('click', function (){
    //   $('#upload-input').click();
    //   $('.progress-bar').text('0%');
    //   $('.progress-bar').width('0%');
    // });
    const self=this;
    $('#upload-input').on('change', function(){
      $(".uploadcontainer").empty().append(self.getprogressbar("uploadprogress"));

      var files = $(this).get(0).files;
    
      if (files.length > 0){
        // One or more files selected, process the file upload
    
        // create a FormData object which will be sent as the data payload in the
        // AJAX request
        var formData = new FormData();
    
        // loop through all the selected files
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
    
          // add the files to formData object for the data payload
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
          self.addUploadButton();
          self.getFileList();
          
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
            $('.progress.bar .uploadprogress').text(percentComplete + '%');
            $('.progress.bar .uploadprogress').width(percentComplete + '%');

            // once the upload reaches 100%, set the progress bar text to done
            if (percentComplete === 100) {
              $('.progress.bar .uploadprogress').html('Done');
            }

          }

        }, false);

        return xhr;
      }
    });
    
    });

      
  },
  constructFunc:function(){
    const self=this;
    $('#nav-profile-tab').on('click',function(){self.getFileList();})
  },
  
  buildFileTable:function(){
    console.log("buildFileList")
    const self=this;
    const options={
        container:".tableplaceholder",
        id:"filetable",
        columns:{
          name:{title:"CSV Files",type:'string'},
          childid:{title:"Ready for Database",
                 type:'convert',
                 className:"tableConvert",
                 render:function(full){return self.htmlConvert(full);},
                 action:function(id,className){return self.htmlConvertAction(id,className);}
          },
          size:{title:"Size",type:'string'},
          datecreated:{title:"Date Uploaded",type:'string'},
          delete:{title:"",
                  type:"delete",
                  className:"rowdelete",
                  render:function(full){return self.htmlrowdelete(full);},
                  action:function(id,className){return self.htmlrowdeleteaction(id,className);}
                 }
          },
        data:function(){return self.filelist;}
      }
    this.tables['file'] = new Table(this.pointer,options) 
  },
  htmlrowdelete:function(){
    return `<button type="button" class="btn btn-danger" con="main">Delete</button>`;
    
  },
  htmlrowdeletedetail:function(rowid){ 
    return  `
    <div class="deletecontainer" rowid={0}>
      <h5>Are you sure?</h5>
      <button type="button" class="btn btn-primary" con="true">Yes</button>
      <button type="button" class="btn btn-primary" con="false">No</button>
    </div>`.format(rowid);
  },
  htmlrowdeletedetailaction:function(id,row,rowid,tr,con){
    const self=this;
    const conF={
      true:function(){self.parent.socket.emit('deletefile',row.data())},
      false:function(){return;}
    };
    
    $('#{0} tbody'.format(id)).on('click', 'div[rowid={0}] button[con="{1}"]'.format(rowid,con), function (e) {
      conF[con]();
      $('#{0} tbody'.format(id)).off('click', 'div[rowid={0}] button[con="true"]'.format(rowid));
      $('#{0} tbody'.format(id)).off('click', 'div[rowid={0}] button[con="false"]'.format(rowid));
      row.child.remove();
      tr.removeClass('shown');
    });
  },
  htmlrowdeleteaction:function(id,className){
    const self = this;
    $('#{0} tbody'.format(id)).on('click', 'td.{0} button[con="main"]'.format(className), function () {
      console.log("click htmlrowdeleteaction")
      var tr = $(this).closest('tr');      
      var row = self.tables['file'].datatable.row( tr );
      var obj = row.data();
      var rowid = row[0][0];
      console.log('row',row[0][0])
      // $(this).children("button").children("i").toggleClass("glyphicon-plus glyphicon-minus")
      // if(row.child.isShown()) {
      //   row.child.hide();
      //   tr.removeClass('shown');
      // } else {        
      row.child(self.htmlrowdeletedetail(rowid)).show();
      tr.addClass('shown');
      self.htmlrowdeletedetailaction(id,row,rowid,tr,'true');
      self.htmlrowdeletedetailaction(id,row,rowid,tr,'false');
      // }
    });    
  },
  htmlConvertAction:function(id,className){
    const self = this;
    $('#{0} tbody'.format(id)).on('click', 'td.{0} button'.format(className), function () {
      console.log("here")
      var tr = $(this).closest('tr');      
      var row = self.tables['file'].datatable.row( tr );
      var obj = row.data();
      obj.htmlid = 'myid';
      self.parent.socket.emit('convertcsv',obj);
      $(this).parent().empty().append(self.getprogressbar('myid'))
    });
    self.parent.socket.on('convertcsv', function(meta){
      if(meta.action==="done"){
        $('.progress.bar'.format(meta.htmlid)).parent().empty().append(self.htmlConverted());
      } else {
        $('.progress.bar .{0}'.format(meta.htmlid)).css('width', meta.progress+'%').attr('aria-valuenow', meta.progress).text('{0}% Complete'.format(parseInt(meta.progress+1)));
        $('.progresstext.{0}'.format(meta.htmlid)).text(meta.action);
      }
      console.log()
    });
    
  },
  getprogressbar:function(id){
    return `
            
            <div class="progress bar">
              <div class="progress-bar progress-bar-success {0}" role="progressbar" aria-valuenow="0"
              aria-valuemin="0" aria-valuemax="100" style="width:0%">
                0% Complete
              </div>
            </div>
            <div class="progresstext {0}"></div>
            `.format(id);
  },
  htmlConverted:function(){
    return `<span><i class="fa fa-check-circle fa-2x successicon" aria-hidden="true"></i></span>`;
  },
  htmlConvert:function(full){
    const falsehtml = `<button type="button" class="btn btn-primary">Convert</button>`;
    const truehtml = this.htmlConverted();
    return (full.childid)?truehtml:falsehtml;
  },
  htmlCheck:function(full){
    return `<label class="custom-control custom-checkbox mb-2 mr-sm-2 mb-sm-0">
              <input type="checkbox" class="custom-control-input" {0}>
              <span class="custom-control-indicator"></span>
            </label>
            `.format((full.childid)?'checked':'');
  },  
  get renderhtml(){
      return this.modals[this.name];
  },
  modals:{upload:`<!-- Modal -->
        <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Database Management</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body uploadContainer">
              
              
              
             <nav class="nav nav-tabs" id="myTab" role="tablist">
              <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#nav-home" role="tab" aria-controls="nav-home" aria-selected="true">Upload</a>
              <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">Files</a>
              <a class="nav-item nav-link" id="nav-contact-tab" data-toggle="tab" href="#nav-contact" role="tab" aria-controls="nav-contact" aria-selected="false">Databases</a>
            </nav>
            <div class="tab-content" id="nav-tabContent">
              <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
                
                <div class="container">
                    <div class="row">
                      <div class="col-sm-12 tableplaceholder">
                      
                      </div>
                    </div>
                </div>
                
              
              </div>
              <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
                
              
              
              </div>
              <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab">
              
              
              
              </div>
            </div>
              
              
              
                
            
            
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary">Save changes</button>
              </div>
            </div>
          </div>
        </div>`,
    other:``,
    other2:``,
  },
  defaultdropzone:function(){
    return `<DIV id="preview-template" style="display: none;">
<DIV class="dz-preview dz-file-preview">
<DIV class="dz-image"><IMG data-dz-thumbnail=""></DIV>
<DIV class="dz-details">
<DIV class="dz-size"><SPAN data-dz-size=""></SPAN></DIV>
<DIV class="dz-filename"><SPAN data-dz-name=""></SPAN></DIV></DIV>
<DIV class="dz-progress"><SPAN class="dz-upload" 
data-dz-uploadprogress=""></SPAN></DIV>
<DIV class="dz-error-message"><SPAN data-dz-errormessage=""></SPAN></DIV>
<div class="dz-success-mark">
  <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">
    <title>Check</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
        <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#FFFFFF" sketch:type="MSShapeGroup"></path>
    </g>
  </svg>
</div>
<div class="dz-error-mark">
  <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">
      <title>error</title>
      <desc>Created with Sketch.</desc>
      <defs></defs>
      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
          <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#FFFFFF" fill-opacity="0.816519475">
              <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>
          </g>
      </g>
  </svg>
</div>`
  }
}



                // <div class="container">
                //   <div class="row">
                //     <div class="col-sm-12">
                //       <div class="panel panel-default">
                //         <div class="panel-body">
                //           <span class="glyphicon"><i class="fa fa-cloud-upload fa-4x" aria-hidden="true"></i></span>
                //           <div class="progress">
                //             <div class="progress-bar" role="progressbar"></div>
                //           </div>
                //           <button class="btn btn-lg upload-btn" type="button">Upload File</button>
                //         </div>
                //       </div>
                //     </div>
                //   </div>
                // </div>

                // <input id="upload-input" type="file" name="uploads[]" multiple="multiple"></br>
