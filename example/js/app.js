'use strict';

// Declare app level module which depends on filters, and services
angular.module('perfExampleApp', [
    'perfMonitor'
])

    .config(['perfMonitorProvider', function(perfMonitorProvider) {
       perfMonitorProvider.setOptions({
           logMetrics: true,
           reportThreshold: 1,
           beaconUrl: 'img/beacon.png'
       });
    }])

    .run(function($rootScope, perfMonitor) {
        perfMonitor.monitorDigest($rootScope);
    })

    .controller('Controller1', ['$scope', '$timeout', 'perfMonitor', function($scope, $timeout, perfMonitor) {
        perfMonitor.startView("exampleView");
        perfMonitor.startMarker('Controller1');

        $timeout(function() {
            $scope.Loaded = true;
            perfMonitor.endMarker('Controller1');
        }, (Math.random()*10)*1000);

    }])


    .controller('Controller2', ['$scope', '$timeout', 'perfMonitor', function($scope, $timeout, perfMonitor) {
        perfMonitor.startMarker('Controller2');
        $timeout(function() {
            $scope.Products = { Names: ['Banana','Phone'], SaleType: 'TodayOnly' };
            perfMonitor.endMarker('Controller2');
        }, (Math.random()*10)*1000);

    }])

    .controller('Controller3', ['$scope', '$timeout', 'perfMonitor', function($scope, $timeout, perfMonitor) {
        perfMonitor.startMarker('Controller3');

        var loaded = function() {
            if($scope.Object1 && $scope.Object2 && $scope.Object3){
                $scope.Status = { Complete: true };
                perfMonitor.endMarker('Controller3');
            }
        };


        $timeout(function() {
            $scope.Object1 = {x:193};

            loaded();
        }, (Math.random()*10)*1000);


        $timeout(function() {
            $scope.Object2 = {y:293};

            loaded();
        }, (Math.random()*10)*1000);


        $timeout(function() {
            $scope.Object3 = {z:444};

            loaded();
        }, (Math.random()*10)*1000);

    }])
;


