'use strict';

var historyFallback = require('connect-history-api-fallback');
var log = require('connect-logger');
var yargs = require('yargs');
var sync = require('browser-sync').create();
var path = require('path');

// Load optional browser-sync config file
var bsConfigPath = path.resolve('bs-config');
var options = {};
try {
  options = require(bsConfigPath);
} catch (err) { } // silent error

// Process CLI arguments
yargs.option('files', {
  describe: 'array of file paths to watch',
  type: 'array'
});
var argv = yargs.argv;
setArgOverrides(options, argv);

function setArgOverrides(o, argv) {
  o.port = argv.port || o.port || 3000;
  o.openPath = argv.open || o.openPath || '.';
  o.files = argv.files || o.files || [
    o.openPath + '/**/*.html',
    o.openPath + '/**/*.css',
    o.openPath + '/**/*.js'
  ];
  o.server = o.server || {};
  o.server.baseDir = argv.baseDir || o.server.baseDir || './';
  o.server.middleware = o.server.middleware || [
    log(),
    historyFallback({ index: '/' + o.openPath + '/' + (argv.indexFile || 'index.html') })
  ]
}

if (argv.verbose) {
  console.log('options', options);
}

// Run browser-sync
sync.init(options);
