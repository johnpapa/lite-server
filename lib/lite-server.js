var historyFallback = require('connect-history-api-fallback');
var log = require('connect-logger');
var proxyMiddleware = require('http-proxy-middleware');
var yargs = require('yargs');
var sync = require('browser-sync').create();
var defaultOpenPath = '';
var defaultApiContext = '/api'
var defaultApiTarget = 'http://localhost:3002/'

yargs.option('files', {
  describe: 'array of file paths to watch',
  type: 'array'
});

yargs.option('api', {
  describe: 'enable api proxy',
  type: 'string',
  default: false
});

yargs.option('api-context', {
  describe: 'api context matcher',
  type: 'string',
  default: false
});

var argv = yargs.argv;
var openPath = getOpenPath();
var indexFile = argv.indexFile || 'index.html'
var options =
  {
    openPath: openPath,
    files: argv.files ? argv.files : [
      openPath + '/**/*.html',
      openPath + '/**/*.css',
      openPath + '/**/*.js'
    ],
    baseDir: argv.baseDir || './',
    fallback: '/' + openPath + '/' + indexFile,
    api: {
      enabled: argv.api !== false || argv['api-context'] !== false
    }
  };

if (options.api.enabled) {
  options.api.context = argv['api-context'] ? argv['api-context'] : defaultApiContext;
  options.api.target = argv.api ? argv.api : defaultApiTarget;
}

if (argv.verbose) {
  console.log('options', options);
}

function getOpenPath() {
  var src = argv.open || defaultOpenPath;
  if (!src) {
    return '.'
  }
  return src;
}

var middleware = [
  log(),
  historyFallback({ index: options.fallback })
];

if (options.api.enabled) {
  var proxy = proxyMiddleware(options.api.context, { target: options.api.target });
  middleware.push(function(req, res, next) {
    req.url = req.originalUrl;
    proxy(req, res, next);
  });
}

sync.init({
  port: argv.port || 3000,
  server: {
    baseDir: options.baseDir,
    middleware: middleware
  },
  files: options.files,
});
