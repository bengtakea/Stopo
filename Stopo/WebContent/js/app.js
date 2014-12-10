'use strict';

/* App Module */

var stopoApp = angular.module('stopoApp', [
  'ngRoute',
  'stopoControllers',
  'stopoServices'
]);

stopoApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/portfolio', {
        templateUrl: 'partials/list.html',
        controller: 'ListCtrl'
      }).
      otherwise({
        redirectTo: '/portfolio'
      });
  }]);
