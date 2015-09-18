var indexer = require("../lib/indexer.js");
var should = require("chai").should();

describe("Indexer", function() {

	it("should be a function demanding on or more paths, returning a new object", function() {

		indexer.should.be.a("function");

		indexer.bind(indexer).should.throw();

		var first = indexer("./");
		first.should.be.an("object");

		var second = indexer("./");
		second.should.be.an("object");

		first.should.not.equal(second);

	});

	it("should be an object with the expected methods and properties", function() {

		var i = indexer("./");

		i.should.have.property("absolutePath").that.is.a("function");
		i.should.have.property("use").that.is.a("function");
		i.should.have.property("index").that.is.a("function");

	});

	describe(".absolutePath()", function() {

		it("should return a full path", function () {
			
			var i = indexer("./");

			i.absolutePath.bind(i).should.not.throw();

			var result = i.absolutePath();

			result.should.be.a("string");
			result.should.match(/courtship$/);
			result.should.not.match(/\.\./);
			result.should.match(/^(\/|[a-zæøå]:\\)/i);

		});

	});

	describe(".index()", function() {

		var endsWith = function(str, suffix) {
		    return str.indexOf(suffix, str.length - suffix.length) !== -1;
		}

		it("should build a list of files and directories", function() {

			var i = indexer("./");

			return i.index().then(function(result) {

				result.should.be.an("array");

				result.filter(function(item) { return item.stat.isDirectory(); }).length.should.be.above(0);
				result.filter(function(item) { return item.stat.isFile(); }).length.should.be.above(0);

				var first = result[0];

				first.should.be.an("object");
				first.should.have.property("path").that.is.a("string");
				first.should.have.property("stat").that.is.an("object");

				result.filter(function(item) { return endsWith(item.path, "README.md"); }).length.should.be.above(0);

			});

		});

		it("should contain README.md, package.json, lib/indexer.js and test/indexer.js", function() {

			var path = require("path");
			var projectdir = path.resolve(path.join(__dirname, "/../"));
			
			var expectedFiles = ['README.md', 'package.json', 'lib/indexer.js', 'test/indexer.js'];

			var i = indexer("./");

			return i.index().then(function(result) {

				var filepaths = result.map(function(item) { return item.path; });

				expectedFiles.forEach(function(item) {
					var fullpath = path.join(projectdir, item);
					filepaths.should.contain(fullpath);
				});

			});

		});

	});

	describe(".use()", function() {

		it("should take a function that can manipulate the file object", function() {

			var i = indexer("./");

			i.use(function(file) {
				file.appendpath = file.path + "appended";
			});

			i.use(function(file) {
				file.someinteger = 10;
			});

			return i.index().then(function(result) {

				var first = result[0];
				first.should.have.property("appendpath", first.path + "appended");
				first.should.have.property("someinteger", 10);

			});

		});

		it("should be able to invalidate files in the list", function() {

			var i = indexer("./");

			i.use(function(file) {
				return false;
			});

			return i.index().then(function(result) {

				result.length.should.equal(0);

			});

		});

	});


})