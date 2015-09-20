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
		DBService.getImagesByTags($scope.query)
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
			allTags: '=?',
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
						var newTagName = sanitizeTagName($(textinput).val());
						// only add unique, new tags
						if (newTagName.length && scope.tags.indexOf(newTagName) == -1){
							scope.tags.push(newTagName);
						}
						$(textinput).val("");
					});
					
					event.preventDefault();
				}
				// if no text, go back to editing previous tag when backspace is pressed.
				if (event.which === 8) {
					var textinput = element[0].querySelector('input.taginput-text');
					if ($(textinput).val().length == 0){
						scope.$apply(function(){
							scope.modified = true;
							var lastTag = scope.tags.pop();
							$(textinput).val(lastTag);
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
				if (scope.allTags){
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
				}
			});

			scope.deleteTag = function(tag){
				scope.modified = true;
				scope.tags.splice(scope.tags.indexOf(tag), 1);
			}
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