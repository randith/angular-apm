describe('PerfMonitor tests', function() {
    var $httpBackend, perfMonitorProvider;

    beforeEach(function() {

        // expose provider and set default options for testing
        angular.module('testDummy', ['perfMonitor'])
            .config(['perfMonitorProvider', function(_perfMonitorProvider) {
                _perfMonitorProvider.setOptions({
                    logMetrics: true,
                    reportThreshold: 0,
                    beaconUrl: 'img/beacon.png'
                });
                perfMonitorProvider = _perfMonitorProvider;
            }])
        ;

        // module to test and testDummy
        module('perfMonitor', 'testDummy');

        // general injections
        inject(function(_$httpBackend_) {
            $httpBackend = _$httpBackend_;
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('perfMonitor should be definable', inject(['perfMonitor', function(perfMonitor) {
        expect(perfMonitor).toBeDefined();
    }]));

    it('markers should be reported in order they complete', inject(['perfMonitor', function(perfMonitor) {

        // actual report time varies in test
        $httpBackend
            .expectGET(/img\/beacon.png\?markers=two:\d+,one:\d+,three:\d+/)
            .respond(200, {});

        perfMonitor.startMarker("one");
        perfMonitor.startMarker("two");
        perfMonitor.endMarker("two");
        perfMonitor.startMarker("three");
        perfMonitor.endMarker("one");
        perfMonitor.endMarker("three");

        $httpBackend.flush();

    }]));

    it('view based reporting should trigger on end view', inject(['perfMonitor', function(perfMonitor) {

        perfMonitorProvider.setOptions({
            logMetrics: true,
            reportThreshold: 0,
            beaconUrl: 'img/beacon.png',
            reportOnEndView: true
        });


        // actual report time varies in test
        $httpBackend
            .expectGET(/img\/beacon.png\?MyView=two:\d+/)
            .respond(200, {});

        // calling before view should console warn but not be seen in results
        perfMonitor.startMarker("one");

        perfMonitor.startView("MyView");

        perfMonitor.startMarker("two");
        perfMonitor.endMarker("two");

        // three is dropped because view ends before it does
        perfMonitor.startMarker("three");

        perfMonitor.endView();
        $httpBackend.flush();

    }]));


});