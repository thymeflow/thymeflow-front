import Ember from 'ember';

export default Ember.Component.extend({
  uploadUrl: '/',
  uploadParam: 'upload',
  limitMultiFileUploads: void 0,
  tagName: 'div',
  filename: null,
  acceptFileTypes: /(\.|\/)(zip|vcf|ics|eml|json)$/i,
  uploading: false,
  method: 'POST',
  dataType: 'json',
  uploadProgress: 0,
  error: null,
  success: null,
  fileIsTooLargeMessage: "File is too large.",
  uploadErrorMessage: "Error uploading file.",
  progressBarStyle: (function() {
    return Ember.String.htmlSafe('width: ' + this.get('uploadProgress') + '%');
  }).property('uploadProgress'),
  _initializeUploader: (function() {
    const $upload = this.$();
    $upload.fileupload({
      url: this.get("uploadUrl"),
      type: this.get("method"),
      dataType: this.get("dataType"),
      paramName: this.get('uploadParam'),
      singleFileUploads: true,
      acceptFileTypes: this.acceptFileTypes,
      limitConcurrentUploads: 1
    });
    $upload.on("fileuploadsubmit", (_, data) => {
      const files = data.files;
      let filename = null;
      if(files != null && files.length > 0){
        filename = files[0].name;
      }
      this.setProperties({
        uploadProgress: 0,
        uploading: true,
        filename: filename,
        error: null,
        success: null
      });
      this.sendAction('uploadStarted', {filename: filename});
    });
    $upload.on("fileuploadprogressall", (e, data) => {
      const progress = parseInt(data.loaded / data.total * 100, 10);
      this.set("uploadProgress", progress);
    });
    $upload.on("fileuploaddone", (e, data) => {
      this.setProperties({
        success: true
      });
      this.sendAction('uploadSuccess', {result: data.result});
    });
    $upload.on("fileuploadfail", (e, data) => {
      let error = this.get('uploadErrorMessage');
      if (data.jqXHR) {
        switch (data.jqXHR.status) {
          case 413:
            error = this.get('fileIsTooLargeMessage');
            break;
          default:
        }
      }
      this.setProperties({
        error: error
      });
      this.sendAction('uploadError', {error: error});
    });
    $upload.on("fileuploadalways", () => {
      this.setProperties({
        uploading: false,
        uploadProgress: 0
      });
    });
  }).on("didInsertElement"),
  _destroyUploader: (function() {
    this.$().fileupload("destroy");
  }).on("willDestroyElement")
});