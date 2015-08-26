'use strict';

var app = angular.module('argusUI', []);

app.controller('argusViewCtrl', ['$scope', 'DBService', function($scope, DBService){
	// The current resultset of images
	$scope.resultSet = null;

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
		DBService.loadDB(db_path)
			.success(function(response){
				// TODO show most recent images when db is loaded?
				console.log("Successfully loaded new DB");
			})
			.error(function(){
				console.log("Failed to load new DB");
			});
	};
}]);