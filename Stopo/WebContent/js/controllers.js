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
						'ListOfStocks',
						'Stock',
						'Yahoo',
						'OpenEx',
						'Portfolio',
						function($scope, $http, $interval, ListOfStocks, Stock,
								Yahoo, OpenEx, Portfolio) {
							$scope.refresh = function() {
								$scope.stocks = ListOfStocks
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
												if ($scope.stocks[i].label == 'shipping') {
													$scope.stocks[i].label = 'Shipping'
												}
												if ($scope.stocks[i].label == 'general') {
													$scope.stocks[i].label = 'Allmänt'
												}
											}
										});
								$scope.portfolios = Portfolio.query();

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

							$scope.UpdateCash = function() {
								Portfolio.save($scope.selectedPortfolio, function(
										data) {
									$scope.refresh();
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
																var oldSekValue = $scope.stocks[j].sekValue | 0;
																$scope.stocks[j].sekValue = (rate
																		* $scope.stocks[j].lastQuote * $scope.stocks[j].noShares) | 0;
																$scope.stocks[j].sekCostBasis = (rate * $scope.stocks[j].costBasis) | 0;
																$scope.stocks[j].gain = ($scope.stocks[j].sekValue - $scope.stocks[j].sekCostBasis) | 0;
																$scope.stocks[j].percentgain = ($scope.stocks[j].gain / $scope.stocks[j].sekCostBasis) * 100.0 | 0;
																if (oldSekValue !== $scope.stocks[j].sekValue) {
																	$scope
																			.SumCategories();
																}
																var trailingStopPercent = $scope.stocks[j].trailingStopPercent;
																if (trailingStopPercent > 0) {
																	var stopPrice = $scope.stocks[j].stopPrice;
																	var trailingQuote = Math
																			.round($scope.stocks[j].lastQuote
																					* (1 - trailingStopPercent / 100)
																					* 100) / 100;
																	if (trailingQuote > stopPrice) {
																		$scope.stocks[j].stopPrice = trailingQuote;
																		var st = {};
																		st.yahooTicker = $scope.stocks[j].yahooTicker;
																		st.sid = $scope.stocks[j].sid;
																		st.name = $scope.stocks[j].name;
																		st.label = $scope.stocks[j].label;
																		st.stopPrice = $scope.stocks[j].stopPrice;
																		st.trailingStopPercent = $scope.stocks[j].trailingStopPercent;
																		Stock
																				.save(
																						{
																							id : st.sid
																						},
																						st,
																						function(
																								data) {
																						});
																	}
																}
															}
														}
													}, function(response) {
														$scope.error = true;
													});

								}
							};

							$scope.Update = function() {
								if ($scope.currencyRates) {
									$scope.UpdateQuotes();
								} else {
									$scope.currencyRates = OpenEx.get({},
											function(data) {
												$scope.UpdateQuotes();
											});
								}
							};

							$scope.SumCategories = function() {
								$scope.curr = {
									sum : 0,
									gold : 0,
									energy : 0,
									teck : 0,
									shipping : 0,
									general : 0,
									cash : 0
								};
								$scope.gain = {
									sum : 0,
									gold : 0,
									energy : 0,
									teck : 0,
									shipping : 0,
									general : 0
								};
								var i;
								for (i = 0; i < $scope.stocks.length; i++) {
									$scope.curr.sum += $scope.stocks[i].sekValue;
									$scope.gain.sum += $scope.stocks[i].gain;
									if ($scope.stocks[i].label == 'Guld') {
										$scope.curr.gold += $scope.stocks[i].sekValue;
										$scope.gain.gold += $scope.stocks[i].gain;
									}
									if ($scope.stocks[i].label == 'Energi') {
										$scope.curr.energy += $scope.stocks[i].sekValue;
										$scope.gain.energy += $scope.stocks[i].gain;
									}
									if ($scope.stocks[i].label == 'Teck') {
										$scope.curr.teck += $scope.stocks[i].sekValue;
										$scope.gain.teck += $scope.stocks[i].gain;
									}
									if ($scope.stocks[i].label == 'Shipping') {
										$scope.curr.shipping += $scope.stocks[i].sekValue;
										$scope.gain.shipping += $scope.stocks[i].gain;
									}
									if ($scope.stocks[i].label == 'Allmänt') {
										$scope.curr.general += $scope.stocks[i].sekValue;
										$scope.gain.general += $scope.stocks[i].gain;
									}
								}
								for (i = 0; i < $scope.portfolios.length; i++) {
									$scope.curr.sum += $scope.portfolios[i].cash;
									$scope.curr.cash += $scope.portfolios[i].cash;
								}
							};

							$scope.filterFunction = function(stock) {
								return !$scope.filterZeroStocks
										| stock.noShares > 0;
							}

							$scope.filterZeroStocks = localStorage
									.getItem("zeroStocks") !== null ? $scope
									.$eval(localStorage.getItem('zeroStocks'))
									: true;

							$scope.$watch('filterZeroStocks', function(
									newValue, oldValue) {
								localStorage.setItem('zeroStocks', newValue);
							});

							$scope.portfolios = Portfolio.query();
							$scope.newLabel = 'gold';
							$scope.refresh();
							$scope.curr = {
								sum : 0,
								gold : 0,
								energy : 0,
								teck : 0,
								shipping : 0,
								general : 0,
								cash : 0
							};
							$scope.gain = {
								sum : 0,
								gold : 0,
								energy : 0,
								teck : 0,
								shipping : 0,
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
						Stock.save({
							id : $scope.stock.sid
						}, $scope.stock, function(data) {
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
