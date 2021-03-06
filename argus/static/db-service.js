'use strict';

angular.module('argusUI').

// service that interfaces with the argus server
// Each function corresponds to an endpoint in server.py
factory('DBService', ['$http', function($http){
	var DBService = {};

	DBService.loadDB = function(db_path){
		return $http.post('/load-db/', {db_path: db_path});
	};

	DBService.newDB = function(db_name, folder_path){
		return $http.post('/new-db/', {db_name: db_name, folder_path: folder_path});
	};

	DBService.updateDB = function(){
		return $http.post('/update-db/');
	};

	DBService.getAllImages = function(){
		return $http.get('/get-all-images/');
	};

	DBService.getAllTags = function(){
		return $http.get('/get-all-tags/');
	};

	DBService.getImageTags = function(img_id){
		return $http.get('/get-image-tags/'+img_id);
	};

	DBService.setImageTags = function(img_id, tag_names){
		return $http.post('/set-image-tags/'+img_id, {tag_names: tag_names});
	};

	DBService.getImagesByQuery = function(tag_names){
		return $http.post('/get-images-by-query/', {tag_names: tag_names});
	};

	DBService.getDBInfo = function(){
		return $http.get('/get-db-info');
	};

	return DBService;
}]);