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

            function reset() {
                activeMarkers = {};
                results = [];
                activeCount = 0;
                viewName = undefined;
                viewMarker = undefined;
            }

            /**
             * @param {String} name to report
             * @param $http angular service
             * @param self this
             */
            function reportResults(name, $http, self) {
                if(results.length === 0 && !viewMarker) {
                    console.debug("No results met reportThreshold");
                    reset();
                    return;
                }

                if (viewMarker) {
                    var timeElapsed = new Date() - viewMarker;
                    results.push(viewName + ":" + timeElapsed);
                }

                if (options.logMetrics) {
                    console.log("%o=%o", name, results);
                }

                if (options.beaconUrl) {
                    // disable so that there is no infinite loop
                    self.disable();
                    var _params = {};
                    _params[name] = encodeURI(results.toString());
                    $http({
                        method: "GET",
                        url: options.beaconUrl,
                        params: _params
                    }).then(function (resp) {
                        reset();
                        // so far re-enabling here has been good enough to prevent $digest-report-$digest loop, but it feels risky
                        self.enable();
                    });
                } else {
                    reset();
                }
            }

            this.setOptions = function(newOptions) {
                angular.extend(options, newOptions);
            };

            this.$get = ['$http', function($http) {

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

                    reset();
                    viewName = name;
                    viewMarker = new Date();
                };

                /**
                 * Report the completed markers
                 */
                perfGoodness.endView = function() {
                    if (!options.enabled) {
                        return;
                    }
                    if (!viewName) {
                        reportResults('markers', $http, this);
                    } else {
                        reportResults(viewName, $http, this);
                    }
                };

                /**
                 * Start the time on a measurable item
                 * @param {String} name
                 */
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

                /**
                 * Complete marker and record time
                 * @param {String} name
                 */
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

                /**
                 * Decorate the angular $digest with a marker
                 * @param $rootScope
                 */
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

            }];

        })
    ;

})(window.angular);