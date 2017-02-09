/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    'ember-cli-babel': {
      includePolyfill: true
    },
    // Add options here
    emberCliFontAwesome: {
      useScss: true
    }
  });


  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  // Bootstrap and tether requirement
  app.import(app.bowerDirectory + '/tether/dist/js/tether.js');
  app.import(app.bowerDirectory + '/bootstrap/dist/js/bootstrap.js');

  // Bootbox
  app.import(`${app.bowerDirectory}/bootbox/bootbox.js`);
  app.import('vendor/shims/bootbox.js');

  // adds iframe transport support to jQuery.ajax()
  app.import(`${app.bowerDirectory}/blueimp-file-upload/js/jquery.iframe-transport.js`);
  /* The basic fileupload plugin - it enhances the file upload process,
   but doesn't make any assumptions about the user interface or the
   content-type of the response. */
  app.import(`${app.bowerDirectory}/blueimp-file-upload/css/jquery.fileupload.css`);
  app.import(`${app.bowerDirectory}/blueimp-file-upload/js/vendor/jquery.ui.widget.js`);
  app.import(`${app.bowerDirectory}/blueimp-file-upload/js/jquery.fileupload.js`);
  // extends the basic version of the fileupload plugin and adds file processing functionality.
  app.import(`${app.bowerDirectory}/blueimp-file-upload/js/jquery.fileupload-process.js`);
  // extends the file processing plugin and adds file validation functionality.
  app.import(`${app.bowerDirectory}/blueimp-file-upload/js/jquery.fileupload-validate.js`);
  
  // SPARQL parser for javascript
  app.import('bower_components/sparqljs/sparqljs-browser.js');
  
  // Download.js is used for downloading files from javascript
  app.import('bower_components/downloadjs/download.js');

  // Openlayers 3
  app.import({
    development: 'vendor/ol/ol-debug.js',
    production: 'vendor/ol/ol.js'
  });
  app.import('vendor/ol/ol.css');
  app.import('vendor/shims/ol.js');
  
  return app.toTree();
};
