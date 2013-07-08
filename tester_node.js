var request = require('request');

request.get({
    url: 'http://localhost:9080/api/view/whereis',
    headers: {
	'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
	path : '/storage/annex/alternate/pub/',
	filename: 'arquivo'
    })
}, function(error, response, body){
    debugger;
    console.log('Erro:' + error + ' Code:' + response.statusCode);
    if (!error && response.statusCode == 200){
	console.log(body)
	
    }    
});
	     

    
