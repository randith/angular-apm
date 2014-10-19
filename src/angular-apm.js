/*
 * Copyright 2014 Jive Software
 */
(function(angular) {
    'use strict';

    angular.module('perfMonitor', [])

        .provider('perfMonitor', function() {
            var options = {
                logMetrics: true,
                reportThreshold: 10,
                beaconUrl: undefined,
                enabled: true
            };
            var DIGEST_MARKER = '$digest',
                monitoringDigest = false,
                activeMarkers = {},
                results = [],
                activeCount = 0;

            this.setOptions = function(newOptions) {
                angular.extend(options, newOptions);
            };

            this.$get = function($http) {

                function perfGoodness() {}

                perfGoodness.disable = function() {
                    options.enabled = false;
                };

                perfGoodness.enable = function() {
                    options.enabled = true;
                };

                perfGoodness.startMarker = function(name) {
                    if (!options.enabled) {
                        return;
                    }

                    if (activeMarkers.hasOwnProperty(name)) {
                        console.warn("Tried to create duplicate active performance marker name: " + name);
                        return;
                    }
                    activeMarkers[name] = new Date();
                    activeCount++;
                };

                perfGoodness.endMarker = function(name) {
                    if (!options.enabled) {
                        return;
                    }

                    if (!activeMarkers.hasOwnProperty(name)) {
                        // we have to play a bit loose with digest marker due to it often being started while result is sent
                        if (name !== DIGEST_MARKER) {
                            console.warn("Tried to end nonexistent performance marker: " + name);
                        }
                        return;
                    }

                    var timeElapsed = new Date() - activeMarkers[name];
                    if (timeElapsed >= options.reportThreshold) {
                        results.push(name + ":" + timeElapsed);
                    }
                    delete activeMarkers[name];
                    activeCount--;

                    // report/send results
                    if (activeCount === 0) {

                        // if we are monitoring the $digest assume that the $digest loop will be the last event
                        if (monitoringDigest && name !== DIGEST_MARKER) {
                            return;
                        }

                        if (options.logMetrics) {
                            console.log("markers=%o", results);
                        }

                        if (options.beaconUrl) {
                            // disable so that there is no infinite loop
                            this.disable();
                            var that = this;
                            $http({
                                method: "GET",
                                url: options.beaconUrl,
                                params: { "markers": encodeURI(results.toString()) }
                            }).then(function (resp) {
                                results = [];
                                // so far re-enabling here has been good enable to prevent $digest-report-$digest loop, but it feels risky
                                that.enable();
                            });
                        } else {
                            results = [];
                        }
                    }
                };

                perfGoodness.monitorDigest = function($rootScope) {
                    if (!options.enabled) {
                        return;
                    }

                    monitoringDigest = true;
                    var $oldDigest = $rootScope.$digest;
                    var that = this;
                    $rootScope.$digest = function () {
                        that.startMarker(DIGEST_MARKER);
                        $oldDigest.apply($rootScope);
                        that.endMarker(DIGEST_MARKER);
                    };

                };

                return perfGoodness;

            };

        })
    ;

})(window.angular);