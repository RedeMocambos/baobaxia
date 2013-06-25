
/**
   @param {file} file File to upload 
   @return jsonObject Json object with suggested metadata
*/
function pre_publish(file){
    // offline
    // 1. upload the file
    // 2. analyze the file
    suggest_metadata()
    return jsonObject;
}

/**
*/
function publish(){
    // offline

    // write_metadata();
}

/**
*/
function _write_metadata(){
    
}

function suggest_metadata(){
    // offline
    // call suggest_title()
    // call suggest_autor()
}

/**
   @param {Array} array1 Array of tags to join 
   @param {Array} array2 Array of tags to join
   @return jointArray Array with joint tags 
*/
function _join_tags(array1, array2){
    // sync
    return jointArray;
}

/**
*/
function generate_form(){
    // offline
    // verifica policy e gera campos do form
}


/**
   @param {Array} form Array of fields to be checked
*/
function validate(form){
    // offline

    // for each field, check according to policy
    var validatePolicy = new XMLHttpRequest();
    var url = "policies/validation.json";
    
    $.getJSON(url, function(data) {
	for (field in form) {
	    fieldPolicy = eval("data.metadata[0]." + field);
	    check_policy(field, fieldPolicy);
	}
    });    
}

/**
   @param {string} fieldName Name of the field
   @param {string} fieldPolicy Policy applied for this field
*/
function _check_policy(fieldName, fieldPolicy){
    // offline
}