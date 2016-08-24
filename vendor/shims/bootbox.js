(function () {
  function vendorModule() {
    'use strict';

    return {'default': self['bootbox']};
  }

  define('bootbox', [], vendorModule);
})();
