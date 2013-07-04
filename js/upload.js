$(document).ready(function() {
 
    status('Choose a file :)');
 
// Check to see when a user has selected a file
    var timerId;
    timerId = setInterval(function() {
	if($('#userPhotoInput').val() !== '') {
	    clearInterval(timerId);
 
	    $('#uploadForm').submit();
	}
    }, 500);
 
    $('#uploadForm').submit(function() {
	status('uploading the file ...');

	$(this).ajaxSubmit({
 
	    error: function(xhr) {
		status('Error: ' + xhr.status);
	    },
 
	    success: function(response) {

		s$(this).ajaxSubmit({
		    error: function(xhr) {
			status('Error: ' + xhr.status);
		    },
 
		    success: function(response) {
 
			if(response.error) {
			    status('Opps, something bad happened');
			    return;
			}
 
			var imageUrlOnServer = response.path;
 
			status('Success, file uploaded to:' + imageUrlOnServer);
			$('<img/>').attr('src', imageUrlOnServer).appendTo($('body'));
		    }
		});

	    }
	});
 
// Have to stop the form from submitting and causing
// a page refresh - don't forget this
	return false;
    });
 
    function status(message) {
	$('#status').text(message);
    }
});