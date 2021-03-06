var housecall = require("housecall");
var path = require("path");
var fs = require("fs");
var Promise = require("bluebird");

var readdir = Promise.promisify(fs.readdir);
var stat = Promise.promisify(fs.stat);

var filestat = function(file) {

	return stat(file).then(function(result) {
		return { path: file, stat: result };
	}).catch(function(err) {
		return undefined;
	});

}


var Indexer = function(topdir) {

	var self = this;
	var resultindex = [];
	var once = true;

	var visit = function(dir) {

		return readdir(dir).then(function(results) {

			results = results.map(function(item) { return path.join(dir, item); })
			return Promise.all(results.map(filestat));

		}).then(function(results) {

			results = results.filter(function(item) { return item !== undefined });
			var directories = results.filter(function(item) { return item.stat.isDirectory(); }).map(function(item) { return item.path; });
			var files = results;

			if (directories.length > 0) {
				queue.push(directories);
			}
			
			return files;

		}).then(function(files) {

			return files.filter(function(file) {
				return middlewarefunctions.filter(function(func) { 
					return func(file) === false;
				}).length === 0;
			})

		}).then(function(files) {

			var resultfiles = files.filter(function(file) { return !file.remove; });
			resultindex = resultindex.concat(resultfiles);

		});

	};

	var topdir = topdir;
	var queue = housecall(visit, 1);

	self.absolutePath = function() {
		return path.resolve(topdir);
	};

	var middlewarefunctions = [];

	self.use = function(middleware) {
		if (!middleware || typeof middleware !== "function") throw new Error("You must supply a function to .use");

		middlewarefunctions.push(middleware);
	};

	var cancel;

	self.index = function() {
		resultindex = [];

		if (cancel) cancel();

		queue.pause();
		queue.clear();
		queue.push(self.absolutePath());

		return new Promise(function(resolve, reject) {

			var cancellation = function() {
				cancel = null;
				reject("The index was cancelled");
			}

			queue.on("done", function() {
				cancel = null;
				resolve(resultindex);
			});

			cancel = cancellation;

			queue.start();
		});
	};

}

var create = function(topdir) {

	if (!topdir || typeof topdir !== "string") throw new Error("Specify a path");

	return new Indexer(topdir);

}

module.exports = create;