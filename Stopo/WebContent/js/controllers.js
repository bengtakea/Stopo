'use strict';

/* Controllers */

var stopoControllers = angular.module('stopoControllers', []);

stopoControllers
		.controller(
				'ListCtrl',
				[
						'$scope',
						'$http',
						'Portfolio',
						'Stock',
						'Yahoo',
						function($scope, $http, Portfolio, Stock, Yahoo) {
							$scope.refresh = function() {
								$scope.stocks = Portfolio.query();
								var i;
								for (i = 0; i < $scope.stocks.length; i++) {
									if ($scope.stocks[i].label == 'gold') {
										$scope.stocks[i].label = 'Guld'
									}
									if ($scope.stocks[i].label == 'energy') {
										$scope.stocks[i].label = 'Energi'
									}
									if ($scope.stocks[i].label == 'teck') {
										$scope.stocks[i].label = 'Teck'
									}
									if ($scope.stocks[i].label == 'general') {
										$scope.stocks[i].label = 'Allmänt'
									}
								}
							};

							$scope.AddTicker = function() {
								var stock = {};
								Yahoo
										.get(
												{
													symbol : $scope.newTicker
												},
												function(data) {
													$scope.error = false;
													stock.yahooTicker = $scope.newTicker;
													stock.label = $scope.newLabel;
													stock.name = data.query.results.quote["Name"];
													Stock.save(stock, function(
															data) {
														$scope.refresh();
													});
													$scope.newTicker = "";
												}, function(response) {
													$scope.error = true;
												});

							};

							$scope.UpdateQuotes = function() {
								var i;
								for (i = 0; i < $scope.stocks.length; i++) {
									Yahoo
											.get(
													{
														symbol : $scope.stocks[i].yahooTicker
													},
													function(data) {
														$scope.error = false;
														var stock = {};
														stock.yahooTicker = data.query.results.quote["symbol"];
														var j;
														for (j = 0; j < $scope.stocks.length; j++) {
															if ($scope.stocks[j].yahooTicker == stock.yahooTicker) {
																$scope.stocks[j].lastQuote = data.query.results.quote["LastTradePriceOnly"];
																$scope.stocks[j].change = data.query.results.quote["Change"];
															}
														}
													}, function(response) {
														$scope.error = true;
													});

								}
							};

							$scope.newLabel = 'gold';
							$scope.refresh();

						} ]);