var http = require('http');

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
app.get('/api/view/:id', function (request, response) {
    var fileName = request.params.id;
    try {

	var spawn = require('child_process').spawn,
	ga = spawn('git-annex ', ['status --json', '/home/befree/annex/redemocambos/']);

	ga.stdout.on('data', function (data) {
	    response.json(data);
	    console.log('stdout: ' + data);
	});
	
	ga.stderr.on('data', function (data) {
	    console.log('stderr: ' + data);
	});
	
	ga.on('close', function (code) {
	    console.log('child process exited with code ' + code);
	});

    } catch (exeception) {
        response.send(404);
    }
     
});

app.listen(9080);
