'use strict';

var app = angular.module('argusUI', []);

app.controller('argusViewCtrl', ['$scope', 'DBService', function($scope, DBService){
	// The current resultset of images
	$scope.queryResult = null;
	$scope.query = null;
	$scope.selectedImage = null;
	$scope.selectedIndex = null;

	/* EVERYTHING BELOW THIS IS FUNCTION DECALRATIONS */

	// Load an existing database
	$scope.loadDB = function(db_path){
		DBService.loadDB(db_path)
			.success(function(response){
				// TODO show most recent images when db is loaded?
				// Or somehow display fact that database is connected
				console.log("Successfully loaded DB");
			})
			.error(function(){
				console.log("Failed to load DB");
			});
	};

	// Load a new database
	$scope.newDB = function(db_name, folder_path){
		DBService.newDB(db_name, folder_path)
			.success(function(response){
				// TODO show most recent images when db is loaded?
				console.log("Successfully loaded new DB");
			})
			.error(function(){
				console.log("Failed to load new DB");
			});
	};

	// Send a query to the database
	// TODO fancy things like AND and OR
	$scope.sendQuery = function(){
		$scope.queryResult = [];
		$scope.selectedIndex = null;
		$scope.selectedImage = null;
		if(!$scope.query){
			return;
		}
		var tag_names = $scope.query.split(" ").filter(function(e){return e.length;})
		if (tag_names.length == 0){
			return;
		}

		// send tag names to server
		DBService.getImagesByTags(tag_names)
			.success(function(response){
				$scope.queryResult = response.images;
				console.log("Successfully queried database");
			})
			.error(function(){
				console.log("Failed to query database.");
			});
	};

	$scope.selectImage = function(index){
		$scope.selectedIndex = index;
		$scope.selectedImage = $scope.queryResult[index];
	};
}]);

// A directive that binds a function to an 'Enter' keypress event.
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});