'use strict';

/* Services */

var stopoServices = angular.module('stopoServices', ['ngResource']);

stopoServices.factory('Portfolio', ['$resource',
  function($resource){
    return $resource('rest/stoposervice/getstocks', {}, {
      query: {method:'GET', params:{portfolio:'all', label:'all'}, isArray:true}
    });
  }]);
