'use strict';

/* Controllers */

var stopoControllers = angular.module('stopoControllers', []);

stopoControllers
		.controller(
				'ListCtrl',
				[
						'$scope',
						'$http',
						'$interval',
						'Portfolio',
						'Stock',
						'Yahoo',
						'OpenEx',
						function($scope, $http, $interval, Portfolio, Stock,
								Yahoo, OpenEx) {
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
																$scope.stocks[j].percentchange = parseFloat(data.query.results.quote["PercentChange"]);
																var rate = 1.0;
																if (data.query.results.quote["Currency"] == 'USD') {
																	rate = $scope.currencyRates.rates.SEK;
																} else if (data.query.results.quote["Currency"] == 'CAD') {
																	rate = rate = $scope.currencyRates.rates.SEK
																			* (1 / $scope.currencyRates.rates.CAD);
																}
																var value = (rate
																		* $scope.stocks[j].lastQuote * $scope.stocks[j].noShares) | 0;
																$scope.stocks[j].sekValue = (rate
																		* $scope.stocks[j].lastQuote * $scope.stocks[j].noShares) | 0;
																$scope.stocks[j].sekCostBasis = (rate * $scope.stocks[j].costBasis) | 0;
																$scope.stocks[j].gain = ($scope.stocks[j].sekValue - $scope.stocks[j].sekCostBasis) | 0;
																$scope.stocks[j].percentgain = ($scope.stocks[j].gain / $scope.stocks[j].sekCostBasis) * 100.0 | 0;
																$scope.curr.sum += value;
																$scope.gain.sum += $scope.stocks[j].gain;
																if ($scope.stocks[j].label == 'Guld') {
																	$scope.curr.gold += value;
																	$scope.gain.gold += $scope.stocks[j].gain;
																}
																if ($scope.stocks[j].label == 'Energi') {
																	$scope.curr.energy += value;
																	$scope.gain.energy += $scope.stocks[j].gain;
																}
																if ($scope.stocks[j].label == 'Teck') {
																	$scope.curr.teck += value;
																	$scope.gain.teck += $scope.stocks[j].gain;
																}
																if ($scope.stocks[j].label == 'Allmänt') {
																	$scope.curr.general += value;
																	$scope.gain.general += $scope.stocks[j].gain;
																}
															}
														}
													}, function(response) {
														$scope.error = true;
													});

								}
							};

							$scope.Update = function() {
								$scope.curr = {
									sum : 0,
									gold : 0,
									energy : 0,
									teck : 0,
									general : 0
								};
								$scope.gain = {
									sum : 0,
									gold : 0,
									energy : 0,
									teck : 0,
									general : 0
								};
								$scope.currencyRates = OpenEx.get({}, function(
										data) {
									$scope.UpdateQuotes();
								});
							};

							$scope.filterFunction = function(stock) {
								return !$scope.filterZeroStocks
										| stock.noShares > 0;
							}

							$scope.newLabel = 'gold';
							$scope.refresh();
							$scope.curr = {
								sum : 0,
								gold : 0,
								energy : 0,
								teck : 0,
								general : 0
							};
							$scope.gain = {
								sum : 0,
								gold : 0,
								energy : 0,
								teck : 0,
								general : 0
							};
							$scope.predicate = 'name';

							$scope.quoteTimer = $interval(function() {
								$scope.Update();
							}, 60000);

							$scope.$on('$destroy', function() {
								$interval.cancel($scope.quoteTimer);
							})

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
								$scope.transactions[i].date = new Date(
										$scope.transactions[i].date);
							}
						});
					}

					$scope.stock = Stock.get({
						sid : $routeParams.sid
					}, function(stock) {
						$scope.refresh();
					});
					
					$scope.UpdateStock = function() {
						Stock.save({id:$scope.stock.sid}, $scope.stock, function(
								data) {
						});
					}
					
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
