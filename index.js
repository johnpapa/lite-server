module.exports = {
    server: require('./lib/lite-server.js'),
    defaults: require('./lib/config-defaults'),
    fallbackMiddleware: require('./lib/fallback-middleware')
};
