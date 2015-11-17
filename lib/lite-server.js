var historyFallback = require('connect-history-api-fallback');
var log = require('connect-logger');
var yargs = require('yargs');
var sync = require('browser-sync').create();
var defaultSource = '';

yargs.option('files', {
  describe: 'array of file paths to watch',
  type: 'array'
});

var argv = yargs.argv;
var src = getSource();
var options =
  {
    port: argv.port || 3000,
    source: src,
    files: argv.files ? argv.files : [
      src + '/**/*.html',
      src + '/**/*.css',
      src + '/**/*.js'
    ],
    baseDir: argv.baseDir || './',
    fallback: argv.fallback || '/' + src + '/index.html'
  };

if (argv.verbose) {
  console.log('options', options);
}

function getSource() {
  var src = argv.source || defaultSource;
  if (!src) {
    return '.'
  }
  return src;
}

sync.init({
  server: {
    port: options.port,
    baseDir: options.baseDir,
    middleware: [
      log(),
      historyFallback({ index: options.fallback })
    ]
  },
  files: options.files,
});
