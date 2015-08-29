'use strict';

function sanitizeTagName(name) {
	return name.toLowerCase().replace(/[^0-9a-z]+/g, "-");
}