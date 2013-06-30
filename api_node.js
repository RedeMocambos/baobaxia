var http = require('http');
var url = require('url');

var express = require('express');
var app = express();
app.configure(function() {
    app.use(express.bodyParser()); // used to parse JSON object given in the request body
});


/**
 * HTTP GET /api/view:id
 * Param: :id is filepath
 * Returns: file metadatas in a JSON format
 * Error: 404 HTTP code if the task doesn't exists
 */

app.post('/api/view', function (request, response) {
    console.log('>>> Request.params:   ' + request.params);
    console.log('>>> Request.body:   '+ request.body);

    var path = request.body.path;
    console.log('>>> Request.body.path:   '+ request.body.path);
    var fileName = request.body.filename;
    console.log('>>> Request.body.filename:   '+ request.body.filename);
    
    try {
    
	var spawn = require('child_process').spawn;
	console.log('Starting directory: ' + process.cwd());
	try {
	    process.chdir(path);
	    console.log('New directory: ' + process.cwd());
	}
	catch (err) {
	    console.log('chdir: ' + err);
	}
	
	ga = spawn('git-annex', ['whereis', '--json', fileName, '']);
	response.setHeader('Content-Type', 'text/json; charset=utf-8');
	
	ga.stdout.on('data', function (data) {
	    response.end(data);
	});
	
	ga.stdout.on('data', function (data) {
	    console.log('>>> Request.params:   ' + data);
	});
	
	ga.stderr.on('data', function (data) {
	    console.log('stderr: ' + data);
	});
	
	ga.on('close', function (code) {
	    console.log('child process exited with code ' + code);
	});

    } catch (exception) {
        response.send(404);
    }
     
});

app.listen(9080);
