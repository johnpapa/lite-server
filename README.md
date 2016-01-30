# lite-server

Lightweight *development only* node server that serves a web app, opens it in the browser, refreshes when html or javascript change, injects CSS changes using sockets, and has a fallback page when a route is not found.

## Usage

The default behavior serves from the current folder, opens a browser, and applies a HTML5 route fallback to `./index.html`.

```
$ lite-server
```

## Custom configuration
lite-server utilizes [Browsersync](https://www.browsersync.io/), and allows for configuration overrides via a local `bs-config.json` or `bs-config.js` file in your project.

For example, to change the server port, watched file paths, and base directory for your project (`bs-config.json`):
```
{
  "port": 8000,
  "files": ["./src/**/*.html", "./src/**/*.css", "./src/**/*.js"],
  "server": { "baseDir": "./src" }
}
```

A more complicated example with modifications to the server middleware ('bs-config.js'):
```
// Requires running `npm i connect-history-api-fallback --save-dev` in local project
module.exports = {
  server: {
    middleware: {
       0: null,  // removes logger middleware
       1: require('connect-history-api-fallback')({index: '/index.html', verbose: true})
    }
  }
};
```

A list of the entire set of Browsersync options can be found in its docs: <http://www.browsersync.io/docs/options/>

## License

Code released under the [MIT license](./LICENSE).
