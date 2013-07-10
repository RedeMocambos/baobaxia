var request = require('request');

var fileName = 'LEIAME.txt';

request.get({
    url: 'http://bbx/api/view/whereis/'+fileName,
    headers: {
	'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
	path : '/home/befree/annex/pub/',
	filename: fileName
    })
}, function(error, response, body){
    debugger;
    console.log('Erro:' + error + ' Code:' + response.statusCode);
    if (!error && response.statusCode == 200){
	console.log(body)
	
    }    
});
	     

    
