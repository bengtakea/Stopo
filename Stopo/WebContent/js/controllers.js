'use strict';

/* Controllers */

var stopoControllers = angular.module('stopoControllers', []);

stopoControllers.controller('ListCtrl', [ '$scope', 'Portfolio',
		function($scope, Portfolio) {
			$scope.stocks = Portfolio.query();

			$scope.AddTicker = function(ticker) {
				alert("Hej");
//				Portfolio.Add(ticker);
			};

		} ]);