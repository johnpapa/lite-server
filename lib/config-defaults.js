var historyFallback = require('connect-history-api-fallback');
var log = require('connect-logger');
/*
 | For up-to-date information about the options:
 |   http://www.browsersync.io/docs/options/
 */
module.exports = {
    "files": [
      './**/*.html', './**/*.css', './**/*.js'
    ],
    "server": {
      "baseDir": './',
      "middleware": {
        0: log({format: '%date %status %method %url'}),
        1: historyFallback({"index": '/index.html'})
      }
    }
};
