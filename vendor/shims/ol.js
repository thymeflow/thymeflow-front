(function () {
  function vendorModule() {
    'use strict';

    return {'default': self['ol']};
  }

  define('ol', [], vendorModule);
})();
