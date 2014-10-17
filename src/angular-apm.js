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
        // TODO should be configurable
        var reportThreshhold = 1;

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
                // TODO logging or not should be configurable
//                console.time(PERF_NAME + "." + name);

                console.log("Starting " + name);
                if (activeMarkers.hasOwnProperty(name)) {
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

                if (!activeMarkers.hasOwnProperty(name)) {
                    // we have to play a bit loose with digest marker due to it often being started while result is sent
                    if (name !== DIGEST_MARKER) {
                        console.warn("Tried to end nonexistent performance marker: " +  name);
                    }
                    return;
                }

                var timeElapsed = new Date() - activeMarkers[name];
                if (timeElapsed >= reportThreshhold) {
                    results.push(name + ":" + timeElapsed);
                }
                delete activeMarkers[name];
                activeCount--;

                // send results
                if (activeCount === 0) {

                    // if we are monitoring the $digest assume that the $digest loop will be the last event
                    if (monitoringDigest && name !== DIGEST_MARKER) {
                        return;
                    }

                    // disable so that there is no infinite loop
                    this.disable();
                    var that = this;
                    $http({
                        method: "GET",
                        // TODO needs to be configurable
                        url: "img/beacon.png",
                        params: { "metrics": encodeURI(results.toString()) }
                    }).then(function(resp) {
                        results = [];
                        // so far re-enabling here has been good enable to prevent $digest-report-$digest loop, but it feels unsure
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
