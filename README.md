Create file indexer with a top-level directory and call index(). Will return an array of file paths and stats for each file. Provides a "middleware" function to intercept each file and modify the object, or optionally remove the item.

## Install
```
npm install courtship
```

## Usage

Creation and indexing:

```javascript
var courtship = require("courtship");

var indexer = courtship("./");

indexer.index().then(function(results) {
	// results is an array of { path, stat }
});
```

Interception:

```
var indexer = courtship("./");

indexer.use(function(file) {
	file.somevalue = file.path + ; // Insert extra data
});
```

If the middleware function explicitly returns false, that item is filtered out:

```
var indexer = courtship("./");

indexer.use(function(file) {
	return file.stat.isFile(); // Return files only
});

var minimatch = require("minimatch");

indexer.use(function(file) {
	return minimatch(file.path, "**/*.js") // javascript only
});
```