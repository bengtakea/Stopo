'use strict';

/* Services */

var stopoServices = angular.module('stopoServices', [ 'ngResource' ]);

stopoServices.factory('Portfolio', [ '$resource', function($resource) {
	return $resource('rest/stoposervice/getstocks', {}, {});
} ]);

stopoServices.factory('Stock', [ '$resource', function($resource) {
	return $resource('rest/stoposervice/stock/:id', {}, {});
} ]);

stopoServices
		.factory(
				'Yahoo',
				[
						'$resource',
						function($resource) {
							return $resource(
									"http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20WHERE%20symbol%3D':symbol"
											+ "'&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys",
									{}, {});
						} ]);

stopoServices.factory('Trans', [ '$resource', function($resource) {
	return $resource('rest/stoposervice/trans', {}, {});
} ]);

