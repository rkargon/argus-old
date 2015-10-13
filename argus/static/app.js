'use strict';

var app = angular.module('argusUI', []);

app.controller('argusViewCtrl', ['$scope', '$document', 'DBService', function($scope, $document, DBService){

	/* FUNCTION DECLARATIONS */

	// Load an existing database
	$scope.loadDB = function(db_path){
		$scope.clearDBInfo();
		DBService.loadDB(db_path)
		.success(function(response){
				// TODO show most recent images when db is loaded?
				// Or somehow display fact that database is connected
				console.log("Successfully loaded DB");
				$scope.getDBInfo();
			})
		.error(function(){
			console.log("Failed to load DB");
		});
	};

	// Load a new database
	$scope.newDB = function(db_name, folder_path){
		$scope.clearDBInfo();
		DBService.newDB(db_name, folder_path)
		.success(function(response){
				console.log("Successfully loaded new DB");
				$scope.getDBInfo();
			})
		.error(function(){
			console.log("Failed to load new DB");
		});
	};

	$scope.updateDB = function(){
		DBService.updateDB()
		.success(function(response){
			console.log("Successfully updated DB");
			$scope.getDBInfo();
		})
		.error(function(){
			console.log("Failed to update DB");
		})
	}

	$scope.getAllImages = function(){
		$scope.clearQuery();
		DBService.getAllImages()
			.success(function(response){
				$scope.queryResult = response.images;
			})
			.error(function(){
				console.log("Failed to load all images.");
			});
	}

	$scope.getAllTags = function(){
		DBService.getAllTags()
			.success(function(response){
				$scope.allTags = response.tags.map(function(t){ return t.name; });
			})
			.error(function(){
				console.log("Failed to load all tags.");
			});
	}

	// Send a query to the database
	// TODO fancy things like AND and OR
	$scope.sendQuery = function(){
		$scope.deselectImage();
		$scope.currentQuery = null;
		$scope.queryResult = null;
		if(!$scope.query || $scope.query.length == 0){
			return;
		}
		// send tag names to server
		DBService.getImagesByQuery($scope.query)
			.success(function(response){
				$scope.currentQuery = $scope.query.slice();
				$scope.queryResult = response.images;
				console.log("Successfully queried database");
			})
			.error(function(){
				console.log("Failed to query database.");
			});
	};

	// select an image from $scope.queryResult by index.
	$scope.selectImage = function(index){
		$scope.selectedIndex = index;
		$scope.selectedImage = $scope.queryResult[index];
	};

	// clears the selected image.
	$scope.deselectImage = function(){
		$scope.selectedIndex = null;
		$scope.selectedImage = null;
	};

	// cycle the selected image among the query result moving by 'inc' places in the array.
	$scope.cycleImage = function(inc){
		if (!$scope.selectedImage){
			return;
		}

		// get new index, mod out by length of array to get a valid array index
		var i = $scope.selectedIndex + inc;
		var n = $scope.queryResult.length;
		i = ((i%n)+n)%n;

		$scope.selectedIndex = i;
		$scope.selectedImage = $scope.queryResult[i];
	}

	// clears the current query (e.g. when starting a new query)
	$scope.clearQuery = function(){
		$scope.deselectImage();
		$scope.query = [];
		$scope.queryResult = null;
		$scope.currentQuery = [];
	}

	// clears the database info (e.g. when loading a new database)
	$scope.clearDBInfo = function(){
		$scope.dbInfo = null;
		$scope.clearQuery();
	}

	// show a specific menu. If the given menu is already shown, hide it. 
	$scope.showMenu = function(menuName){
		if ($scope.menuStatus == menuName){
			$scope.menuStatus = null;
		} else {
			$scope.menuStatus = menuName;
			switch ($scope.menuStatus){
				case 'info':
				$scope.getDBInfo();
				break;
			};
		}
	}

	$scope.getDBInfo = function(){
		DBService.getDBInfo()
		.success(function(response){
			$scope.dbInfo = response.info;
			if($scope.dbInfo.db_name){
				$scope.getAllTags();
			}
		})
		.error(function(){
			console.log("Could not get DB info.");
		});
	}

	$scope.setTags = function(image){
		DBService.setImageTags(image.imagefile_id, image.tags)
			.success(function(){
				console.log("Successfully set image tags.");
			})
			.error(function(){
				console.log("Failed to set image tags.");
			});
	}

	/* CONTROLLER INITIALIZATION */

	// set of all tags in DB
	$scope.allTags = [];
	// info on the database
	$scope.dbInfo = null;
	// Which menu is currently open. If null, no menu is shown.
	$scope.menuStatus = null;
	// An array of tags representing a query
	$scope.query = [];
	// The current result set of images
	$scope.queryResult = null;
	// The query corresponding to the current query result
	$scope.currentQuery = [];
	// The selected image (and its index in the resultset)
	$scope.selectedImage = null;
	$scope.selectedIndex = null;

	// bind tab key for scrolling through selected images
	$document.bind("keydown", function(event){
		// check for tab key
		if (event.which === 9){
			var inc = event.shiftKey ? -1 : 1;
			$scope.$apply(function(){
				$scope.cycleImage(inc);
			});
			event.preventDefault();
		} 
	});

	$scope.getDBInfo();
}]);

app.directive('paginatedImages', function(){
	return {
		restrict: 'E',
		templateUrl: '/static/templates/paginated-images.html',
		scope: {
			adjacentPages: '@',
			images: '=',
			imagesPerPage: '@',
			imgOnClick: '=?',
		},
		link: function(scope, element, attrs){
			scope.adjacentPages = parseInt(scope.adjacentPages);
			scope.imagesPerPage = parseInt(scope.imagesPerPage);
			scope.pageNum = 1;
			scope.maxPage = Math.floor((scope.images.length-1)/scope.imagesPerPage) + 1;
			// keep track of max number of pages as array changes.
			scope.$watch('images.length', function(newValue, oldValue){
				scope.maxPage = Math.floor((scope.images.length-1)/scope.imagesPerPage) + 1;
			});

			scope.setPage = function(n){
				if(n > 0 && n <= scope.maxPage){
					scope.pageNum = n;
				}
			};
			return;
		}
	};
});

// A textbox that allows user to enter tags. Tags are automatically separated by spaces. 
// Pressing enter 'submits' the tags by executing the expression passed to onEnter. 
app.directive('tagInput', function(){
	return {
		restrict: 'E',
		templateUrl: '/static/templates/tag-input.html',
		scope: {
			allTags: '=',
			isQuery: '=?',
			onEnter: '&',
			placeHolder: '@',
			tags: '='
		},
		link: function(scope, element, attrs) {
			// keeps track if list of tags has been modified
			scope.modified = false;
			element.bind("keydown keypress", function (event) {
				// when space or enter is pressed, create new tag
				if (event.which === 32 || event.which === 13) {
					scope.$apply(function(){
						scope.modified = true;
						scope.suggestion = null;
						var textinput = element[0].querySelector('input.taginput-text');
						var newTagName = $(textinput).val();
						// only add unique, new tags
						if (newTagName.length && scope.findDBTagIndex(scope.tags, newTagName) == -1){
							var newTag = scope.createTag(newTagName);
							scope.tags.push(newTag);
						}
						$(textinput).val("");
					});
					
					event.preventDefault();
				}
				// if no text, go back to editing previous tag when backspace is pressed.
				if (event.which === 8) {
					// if no tags enterred yet, behave like a regular backspace
					if (scope.tags.length == 0){
						return;
					}
					var textinput = element[0].querySelector('input.taginput-text');
					if ($(textinput).val().length == 0){
						scope.$apply(function(){
							scope.modified = true;
							var lastTag = scope.tags.pop();
							$(textinput).val(lastTag.name);
						});
						event.preventDefault();
					}
				}
				// When enter is pressed, directive's value is "saved" and is no longer "modified".
				if (event.which === 13){
					scope.$apply(function(){
						scope.modified = false;
						scope.onEnter();
					});
					event.preventDefault();
				}
			});
			element.bind("input", function(event){
				// Display a suggestion for the current tag
				var currentText = element[0].querySelector('input.taginput-text').value;
				currentText += String.fromCharCode()
				if (!currentText) {
					scope.suggestion = null;
				} else {
					var currentTextClean = sanitizeTagName(currentText);
					var matchingTags = scope.allTags.filter(function(elem){
						return (elem.indexOf(currentTextClean) == 0);
					});
					// TODO actually sort these somehow, ideally by frequency
					if (matchingTags.length > 0){
						scope.suggestion = matchingTags[0];
					} else {
						scope.suggestion = null;
					}
				}
				scope.$apply();
			});

			// Returns the index of a database tag in an array, based on the tag's name
			scope.findDBTagIndex = function(array, tagName){
				return customIndexOf(array, function(elem){
					return elem.name == tagName;
				});
			};

			// return a tag object based on enterred text. 
			// tag syntax is either 'name' or 'type:data'
			// where name, data =~ /[a-z0-9\-]+/
			// if isQuery is false, always return a name tag.
			scope.createTag = function(tagText){
				var colonIndex = tagText.indexOf(':');
				if (scope.isQuery && colonIndex != -1){
					var tagData = tagText.substring(colonIndex+1);
					var tagType = tagText.substring(0, colonIndex);
					switch (tagType){
						// tags / queries that specify a certain size
						case 'size':
							var sizeRegex = "^(\\d+)\\D(\\d+)$";
							var groups = tagData.match(sizeRegex);
							if (groups != null){
								var width = parseInt(groups[1]);
								var height = parseInt(groups[2]);
								return {type: 'size', width: width, height: height};
							}
							break;
						// tags / queries that specify a certain width
						case 'width':
							var widthRegex = "^(\\d+)$";
							var groups = tagData.match(widthRegex);
							if (groups != null){
								var width = parseInt(groups[1]);
								return {type: 'width', width: width};
							}
							break;
						// tags / queries that specify a certain height
						case 'height':
							var heightRegex = "^(\\d+)$";
							var groups = tagData.match(heightRegex);
							if (groups != null){
								var height = parseInt(groups[1]);
								return {type: 'height', height: height};
							}
							break;
					}
				}
				var tagName = sanitizeTagName(tagText);
				return {type: 'db_tag', name: tagName};
			};

			// deletes a tag from the tag array. 
			scope.deleteTag = function(tag){
				scope.modified = true;
				scope.tags.splice(scope.findDBTagIndex(scope.tags, tag.name), 1);
			};
			return;
		}
	};
});

// start - the start value
// total - the number of elements
// min - (optional) An overall minimum, overrides start if it's greater than start
// max - (optional) An overall maximum, overrides total if it's smaller than the would-be maximum (start+total-1)
app.filter('range', function() {
	return function(input, start, total, min, max) {
		start = parseInt(start);
		total = parseInt(total);
		min = parseInt(min);
		max = parseInt(max);
		var finalMin = start;
		var finalMax = start + total - 1;
		if (min != undefined) {
			finalMin = Math.max(min, start);
		}
		if (max != undefined) {
			finalMax = Math.min(max, start+total-1);
		}
		for (var i=finalMin; i<=finalMax; i++){
			input.push(i);
		}
		return input;
	};
});