const fs = require('fs');
const path = require('path');

hexo.extend.injector.register('head_end', function() {
  return '<script type="text/javascript" src="/js/sakura.js"></script>';
});