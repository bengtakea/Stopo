'use strict';

/* Services */

var stopoServices = angular.module('stopoServices', [ 'ngResource' ]);

stopoServices.factory('Portfolio', [ '$resource', function($resource) {
	return $resource('rest/stoposervice/getstocks', {}, {
	});
} ]);

stopoServices.factory('Stock', [ '$resource', function($resource) {
	return $resource('rest/stoposervice/stock/:id', {}, {
	});
} ]);
