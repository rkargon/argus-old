'use strict';

angular.module('argusUI').

factory('dbService', ['$http', function($http){
	var DBService = {};

	DBService.loadDB = function(db_path){
		return $http.post('/load-db', {db_path: db_path});
	}

	DBService.newDB = function(db_name, folder_path){
		return $http.post('/new-db', {db_name: db_name, folder_path: folder_path});
	}

	DBService.updateDB = function(){
		return $http.post('/update-db');
	}

	DBService.getAllImages = function(){
		return $http.get('/get-all-images');
	}

	DBService.addImageTags = function(img_id, tag_names){
		return $http.post('/add-image-tags/'+img_id, {tag_names: tag_names});
	}

	DBService.getImagesByTags = function(tag_names){
		return $http.post('/get-images-by-tags', {tag_names: tag_names});
	}

	return DBService;
}]);