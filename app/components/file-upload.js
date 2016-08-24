import Ember from 'ember';

const FileUpload = Ember.Object.extend({
  file: null,
  uploading: false,
  progress: 0,
  error: null,
  success: null,
  filename: function(){
    const file = this.get('file');
    if(file != null){
      return file.name;
    }else{
      return null;
    }
  }.property('file')
});

export default Ember.Component.extend({
  uploadUrl: '/',
  uploadParam: 'upload',
  tagName: 'div',
  fileUploads: null,
  initFileUploads: function(){
    this.set('fileUploads', Ember.A());
  }.on('init'),
  method: 'POST',
  dataType: 'json',
  fileIsTooLargeMessage: "File is too large.",
  uploadErrorMessage: "Unknown error.",
  _initializeUploader: (function() {
    const $upload = this.$();
    $upload.fileupload({
      url: this.get("uploadUrl"),
      type: this.get("method"),
      dataType: this.get("dataType"),
      paramName: this.get('uploadParam'),
      singleFileUploads: true,
      sequentialUploads: true,
      autoUpload: false
    });
    $upload.on("fileuploadprogress", (e, progressData) => {
      Ember.run(() =>{
        const fileUpload = this.get('fileUploads').find((fileUpload) => fileUpload.get('file') === progressData.files[0]);
        if(fileUpload != null){
          const progress = parseInt(progressData.loaded / progressData.total * 100, 10);
          fileUpload.setProperties({
            'progress': progress
          });
        }
      });
    });
    $upload.on("fileuploadadd", (_, data) =>{
      const files = data.files;
      if(files != null && files.length > 0){
        data.process().done(() => {
          Ember.run(() => {
            const file = files[0];
            const fileUpload = FileUpload.create({
              uploading: true,
              file: file
            });
            const fileUploads = this.get('fileUploads');
            fileUploads.addObject(fileUpload);
            data.submit()
              .fail((e, failData) =>{
                Ember.run(() => {
                  let error = this.get('uploadErrorMessage');
                  if (failData.jqXHR) {
                    switch (failData.jqXHR.status) {
                      case 413:
                        error = this.get('fileIsTooLargeMessage');
                        break;
                      default:
                    }
                  }
                  fileUpload.setProperties({
                    error: error
                  });
                  this.sendAction('uploadError', fileUpload);
                });
              })
              .done((e, doneData) => {
                Ember.run(() => {
                  fileUpload.setProperties({
                    'progress': 100,
                    'success': true,
                    'result': doneData.result
                  });
                  this.sendAction('uploadSuccess', fileUpload);
                  Ember.run.later(this, () => {
                    fileUploads.removeObject(fileUpload);
                  }, 30000);
                });
              })
              .always(() => {
                Ember.run(() => {
                  fileUpload.setProperties({
                    uploading: false
                  });
                });
              });
          });
        });
      }
    });
  }).on("didInsertElement"),
  _destroyUploader: (function() {
    this.$().fileupload("destroy");
  }).on("willDestroyElement")
});