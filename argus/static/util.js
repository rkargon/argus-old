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

function sanitizeTagName(name) {
	return name.toLowerCase().replace(/[^0-9a-z]+/g, "-");
}