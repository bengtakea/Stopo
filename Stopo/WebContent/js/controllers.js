'use strict';

/* Controllers */

var stopoControllers = angular.module('stopoControllers', []);

stopoControllers.controller('ListCtrl', [ '$scope', 'Portfolio', 'Stock',
		function($scope, Portfolio, Stock) {
			$scope.refresh = function() {
				$scope.stocks = Portfolio.query();
			};

			$scope.AddTicker = function() {
				var stock = $scope.stock;
				stock.name = 'Aktie-namn';
				Stock.save($scope.stock, function(data) {
					$scope.refresh();
				});

			};

			$scope.refresh();

		} ]);