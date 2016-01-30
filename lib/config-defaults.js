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
      "middleware": [
        log({format: '%date %status %method %url'}),
        historyFallback({"index": '/index.html'})
      ]
    }
};
