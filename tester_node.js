var request = require('request');

request.post({
    url: 'http://localhost:9080/api/view',
    headers: {
	'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
	path : '/home/befree/annex/redemocambos/mocambolas/vince/',
	filename: 'esquema_infra.pdf'
    })
}, function(error, response, body){
    if (!error && response.statusCode == 200){
	console.log(body)
    }    
//    response.on('end', function(){
//	console.log(JSON.parse(body))
//    });
    
});
	     


    // response.on("data", function(chunk) {
    //     console.log(chunk);
    // });

    // response.end("end", function() {
    //     console.log("end");
    // });





    
