var http = require('http');
var url = require('url');
// var ecstatic = require('ecstatic');

var express = require('express');
var app = express();
app.configure(function() {
    app.use(express.bodyParser()); // used to parse JSON object given in the request body
//    app.use(ecstatic({ root: __dirname }));
});


/**
 * HTTP POST /api/view
 * Returns: file metadatas in a JSON format
 * Error: 404 HTTP code if the task doesn't exists
 */

app.get('/api/view/whereis/:filename', function (request, response) {
    
    var path = '/storage/annex/alternate/pub/';
    
    var fileName = request.params.filename;
    
    try {
	console.log('Starting directory: ' + process.cwd());
	try {
	    process.chdir(path);
	    console.log('New directory: ' + process.cwd());
	}
	catch (err) {
	    console.log('chdir: ' + err);
	}

	var exec = require('child_process').exec,
	child;

	child = exec('git-annex whereis --json ' + fileName,
		     function (error, stdout, stderr) {
			 console.log(stdout);
			 response.end(stdout)
			 console.log(stderr);
			 if (error !== null) {
			     console.log('exec error: ' + error);
			 }
		     });

    } catch (exception) {
        response.send(404);
    }
     
});


app.post('/api/publish', function (request, response){

    pre_publish()
    
    try{
	console.log('Starting directory: ' + process.cwd());
	try {
	    process.chdir(path);
	    console.log('New directory: ' + process.cwd());
	}
	catch (err) {
	    console.log('chdir: ' + err);
	}

	var exec = require('child_process').exec,
	child;

	child = exec('git-annex import --json ' + fileName,
		     function (error, stdout, stderr) {
			 console.log(stdout);
			 response.end(stdout)
			 console.log(stderr);
			 if (error !== null) {
			     console.log('exec error: ' + error);
			 }
		     });

    } catch (exception) {
        response.send(404);
    }
    
});


app.post('/api/upload', function(request, response) {    

    serverRoot = '/storage/annex/pub'; // /home/befree/dev/baobaxia 
    var serverPath = '/images/' + request.files.userPhoto.name;
    
    require('fs').rename(
	request.files.userPhoto.path,
	serverRoot + serverPath,
	function(error) {
	    if(error) {
		response.send({
		    error: 'Ah crap! Something bad happened'
		});
		return;
	    }
	    
	    // TODO: fix
	    // - a resposta nao esta saindo correta, sai HTML da pagina upload.html
	    response.json({
		path: serverPath
	    });
	}
    );
});


app.listen(9080);

function publish_media(JSON){
    
    var path = request.body.path;
    var fileName = request.body.filename;
        
    var exec = require('child_process').exec, 
    child;
    
    child = exec('git-annex import --json ' + path + fileName,
		 function (error, stdout, stderr) {
		     console.log(stdout);
		     response.end(stdout)
		     console.log(stderr);
		     if (error !== null) {
			 console.log('exec error: ' + error);
		     }
		 });
    
}

function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i);
}

