'use strict';

/* App Module */

var stopoApp = angular.module('stopoApp', [ 'ngRoute', 'stopoControllers',
		'stopoServices', 'ui.bootstrap' ]);

stopoApp.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/portfolio', {
		templateUrl : 'partials/list.html',
		controller : 'ListCtrl'
	}).when('/portfolio/:sid', {
		templateUrl : 'partials/detail.html',
		controller : 'DetailCtrl'
	}).otherwise({
		redirectTo : '/portfolio'
	});
} ]);
