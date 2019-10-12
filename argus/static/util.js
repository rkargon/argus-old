'use strict';

function customIndexOf(array, predicate){
	var index = -1;
	array.forEach(function(elem, i, array){
		if (predicate(elem)){
			index = i;
		}
	});
	return index;
}

// Replaces non-alphanumeric characters with '-', and converts to lowercase. 
function sanitizeTagName(name) {
	return name.toLowerCase().replace(/[^0-9a-z]+/g, "-");
}

// Give a text representing a tag input by the user, returns a tag object with the appropriate type and fields. 
function parseTag(tagText) {
    
}
