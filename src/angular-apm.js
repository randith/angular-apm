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
                enabled: true,
                reportOnEndView: false
            };
            var DIGEST_MARKER = '$digest',
                monitoringDigest = false,
                activeMarkers = {},
                results = [],
                activeCount = 0,
                viewName = undefined,
                viewMarker = undefined;

            /**
             * @param {String} name to report
             * @param $http angular service
             * @param self this
             */
            function reportResults(name, $http, self) {
                if (options.logMetrics) {
                    console.log("%o=%o", name, results);
                }

                var _params = {};
                _params[name] = encodeURI(results.toString());

                if (options.beaconUrl) {
                    // disable so that there is no infinite loop
                    self.disable();
                    $http({
                        method: "GET",
                        url: options.beaconUrl,
                        params: _params
                    }).then(function (resp) {
                        results = [];
                        // so far re-enabling here has been good enable to prevent $digest-report-$digest loop, but it feels risky
                        self.enable();
                    });
                } else {
                    results = [];
                }
            }


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

                /**
                 * Start a view
                 * A view is intended to encapsulate a set of related markers
                 * Results reported as viewName=[markers]
                 * @param {String} name
                 */
                perfGoodness.startView = function(name) {
                    if (!options.enabled) {
                        return;
                    } else if (viewName) {
                        console.warn('Called startView "%o" when previous view "%o" not ended');
                        return;
                    }

                    viewName = name;
                    activeCount = 0;
                    activeMarkers = {};
                    results = [];
                    viewMarker = new Date();
                };

                perfGoodness.endView = function() {
                    if (!options.enabled) {
                        return;
                    } else if (!options.reportOnEndView) {
                        console.warn("Called endView with reportOnEndView set to false");
                        return;
                    } else if (!viewName) {
                        console.warn("Called endView when view not started");
                        return;
                    }
                    reportResults(viewName, $http, this);
                };


                perfGoodness.startMarker = function(name) {
                    if (!options.enabled) {
                        return;
                    } else if (activeMarkers.hasOwnProperty(name)) {
                        console.warn("Tried to create duplicate active performance marker name: " + name);
                        return;
                    } else if (options.reportOnEndView && !viewName) {
                        if (name !== DIGEST_MARKER) {
                            console.warn('Called startMarker "%o" with reportOnEndView when view not started', name);
                        }
                        return;
                    }
                    activeMarkers[name] = new Date();
                    activeCount++;
                };

                perfGoodness.endMarker = function(name) {
                    if (!options.enabled) {
                        return;
                    } else if (!activeMarkers.hasOwnProperty(name)) {
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
                    if (!options.reportOnEndView && activeCount === 0) {
                        // if we are monitoring the $digest assume that the $digest loop will be the last event
                        if (monitoringDigest && name !== DIGEST_MARKER) {
                            return;
                        }
                        if (viewName) {
                            reportResults(viewName, $http, this);
                        } else {
                            reportResults('markers', $http, this);
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