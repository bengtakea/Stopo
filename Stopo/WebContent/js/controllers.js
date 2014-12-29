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
								$scope.stocks = Portfolio
										.query(function() {
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
										});

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

stopoControllers.controller('DetailCtrl',
		[
				'$scope',
				'$routeParams',
				'Stock',
				'Trans',
				function($scope, $routeParams, Stock, Trans) {

					$scope.refresh = function() {
						$scope.transactions = Trans.query({
							stockSid : $scope.stock.sid
						}, function() {
							var i;
							for (i = 0; i < $scope.transactions.length; i++) {
								if ($scope.transactions[i].type == 'buy') {
									$scope.transactions[i].type = 'Köp'
								}
								if ($scope.transactions[i].type == 'sell') {
									$scope.transactions[i].type = 'Sälj'
								}
								$scope.transactions[i].date = new Date($scope.transactions[i].date);
							}
						});
					}

					$scope.stock = Stock.get({
						sid : $routeParams.sid
					}, function(stock) {
						$scope.refresh();
					});
					$scope.newType = 'buy';
					$scope.newPortfolio = 'Avanza ISK'

					$scope.today = function() {
						$scope.dt = new Date();
					};
					$scope.today();

					$scope.clear = function() {
						$scope.dt = null;
					};

					// Disable weekend selection
					$scope.disabled = function(date, mode) {
						return (mode === 'day' && (date.getDay() === 0 || date
								.getDay() === 6));
					};

					$scope.toggleMin = function() {
						$scope.minDate = $scope.minDate ? null : new Date();
					};
					$scope.toggleMin();

					$scope.open = function($event) {
						$event.preventDefault();
						$event.stopPropagation();

						$scope.opened = true;
					};

					$scope.dateOptions = {
						formatYear : 'yy',
						startingDay : 1
					};

					$scope.formats = [ 'dd-MMMM-yyyy', 'yyyy/MM/dd',
							'dd.MM.yyyy', 'shortDate' ];
					$scope.format = $scope.formats[0];

					$scope.AddTransaction = function() {
						var trans = {};
						trans.stockSid = $scope.stock.sid;
						trans.type = $scope.newType;
						trans.date = $scope.dt;
						trans.shares = $scope.newShares;
						trans.price = $scope.newPrice;
						trans.portfolio = $scope.newPortfolio;
						Trans.save(trans, function(data) {
							$scope.refresh();
						});
						$scope.newType = 'buy';
						$scope.newShares = null;
						$scope.newPrice = null;
						$scope.newPortfolio = '';
					};

				} ]);
