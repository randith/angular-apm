/*
 * Copyright 2014 Jive Software
 */
angular.module('perfMonitor', [
])

    .factory('perfMonitor', ['$http', function($http) {
        'use strict';


        var DIGEST_MARKER = '$digest';
        var monitoringDigest = false;
        var activeMarkers = {};
        var results = [];
        var activeCount = 0;
        var enabled = true;

        return {

            disable: function() {
                enabled = false;
            },

            enable: function() {
                enabled = true;
            },

            /**
             * @param {string} name for marker to start
             */
            startMarker: function (name) {
                if (!enabled) {
                    return;
                }
//                console.time(PERF_NAME + "." + name);

                if (name in activeMarkers) {
                    console.warn("Tried to create duplicate active performance marker name: " + name);
                    return;
                }
                activeMarkers[name] = new Date();
                activeCount++;

            },

            /**
             * @param {string} name for marker to end
             */
            endMarker: function (name) {
//                console.timeEnd(PERF_NAME + "." + name);

                if (!enabled) {
                    return;
                }

                if (!name in activeMarkers) {
                    console.warn("Tried to end nonexistent performance marker: " +  name);
                    return;
                }

                var timeElapsed = new Date() - activeMarkers[name];
                results.push(name + ":" + timeElapsed);
                delete activeMarkers[name];
                activeCount--;
                if (activeCount === 0) {

                    if (monitoringDigest && name !== DIGEST_MARKER) {
                        return;
                    }

                    // disable so that there is no infinite loop
                    this.disable();
                    var that = this;
                    $http({
                        method: "GET",
                        url: "img/beacon.png",
                        params: { "metrics": encodeURI(results.toString()) }
                    }).then(function(resp) {
                        results = [];
                        that.enable();
                    });
                }

            },

            /**
             */
            monitorDigest: function ($rootScope) {
                if (!enabled) {
                    return;
                }

                monitoringDigest = true;
                var $oldDigest = $rootScope.$digest;
                var that = this;
                $rootScope.$digest = function() {
                    that.startMarker(DIGEST_MARKER);
                    $oldDigest.apply($rootScope);
                    that.endMarker(DIGEST_MARKER);
                };
            }

        };

    }])
;
