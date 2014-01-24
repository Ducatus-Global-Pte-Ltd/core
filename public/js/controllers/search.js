'use strict';

angular.module('insight.search').controller('SearchController',
  function($scope, $routeParams, $location, $timeout, Global, Block, Transaction, Address, BlockByHeight) {
  $scope.global = Global;

  $scope.search = function() {
    var q = $scope.q;

    $scope.badQuery = false;

    BlockByHeight.get({
      blockHeight: q
    }, function(hash) {
      $scope.q = '';
      $location.path('/block/' + hash.blockHash);
    }, function() { // block by height not found
      Block.get({
        blockHash: q
      }, function() {
        $scope.q = '';
        $location.path('block/' + q);
      }, function () { //block not found, search on TX
        Transaction.get({
          txId: q
        }, function() {
          $scope.q = '';
          $location.path('tx/' + q);
        }, function () { //tx not found, search on Address
          Address.get({
            addrStr: q
          }, function() {
            $scope.q = '';
            $location.path('address/' + q);
          }, function () { //address not found, fail :(
            $scope.badQuery = true;
            $timeout(function() {
              $scope.badQuery = false;
            }, 2000);
            $scope.q = q;
          });
        });
      });
    });
  };

});
