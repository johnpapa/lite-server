# lite-server

Lightweight *development only* node server that serves a web app, opens it in the browser, refreshes when html or javascript change, injects CSS changes using sockets, and has a fallback page when a route is not found.

### port
Sets the port to serve. Defaults to 3000.

`--port 3000`

### source
Which folder to open. Defaults to `./`

`--source src`

### files

Array of file patterns to watch. Defaults to all html, css and js.

`--files '/**/*.html' '/**/*.css' '/**/*.js'`

### baseDir

Folder to serve from. Defaults to `./`

`--baseDir './'`

### fallback

File to serve when a route is not found. Useful for SPAs. Defaults to `source` folder + `/index.html`.

`--fallback '/src/index.html'`
