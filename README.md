angular-apm  
==============

Service to set performance markers and report via browser console or HTTP GET to beacon.  
 
This library accomplishes monitoring reporting in a similar way to [angular-performance](http://code.mendhak.com/angular-performance/).  But it functions as a provider instead of a directive and allows many markers to be put into one reporting view enabling a much more detailed understanding of performance.

Installation
------------

You can install ``angular-apm`` via bower

```
bower install angular-apm
```

Other way to install ``angular-apm`` is to clone this repo into your project with this command

```
git clone git@github.com:randith/angular-apm.git
```

Then you need to include ``angular-apm.js`` script into your project

```
<script src="/path/to/angular-apm.min.js"></script>
```

or include `beautified` version with

```
<script src="/path/to/angular-apm.js"></script>
```

To rebuild `min.js` version run

```
grunt build
```

Run example
-----------

To run example execute following commands

```
git clone https://github.com/randith/angular-apm
cd angular-apm
npm -g install bower grunt
npm install
bower install
grunt
```

After this, go at ``127.0.0.1:9001/example`` in your browser, and you will see running example of ``angular-apm``.  
In the logs and the network debugger tab under img/beacon you should metrics such as:
```
exampleView=["$digest:2", "Controller2:329", "$digest:3", "Controller1:402", "$digest:1", "Controller3:8766"] 
```

Usage
-----

First you need to inject ``perfMonitor`` into your angular module.

```
var myApp = angular.module('myApp', ['perfMonitor']);
```
Then you can configure it.

```
    .config(['perfMonitorProvider', function(perfMonitorProvider) {
        perfMonitorProvider.setOptions({
            logMetrics: true,
            reportThreshold: 10,
            beaconUrl: undefined,
            enabled: true,
            reportOnEndView: false
        });
    }])
```

Then, if you want to use it from your controller

```
myApp.controller('cookieController', ['$scope', 'perfMonitor', function($scope, perfMonitor) {
  // your code here
}]);
```

#### Start View

Start a view with a specified name
```
perfMonitor.startView(name)
```

A view is intended to encapsulate a set of related markers.  The view name will be the used in reporting so it is highly recommended to set.  Also, only one view can be active at a time, for now.
  
If no view is set the reports will use the name 'markers'. 


#### Start marker 

Start a marker with a specified name
```
perfMonitor.startMarker(name)
```

The name must be unique for active markers.  Serial repetition of names is ok.  

#### End marker 

End given a marker with a specified name
```
perfMonitor.endMarker(name)
```

#### End view

End view and send report
```
perfMonitor.endView()
```

This is only valid when reportOnEndView=true.  Otherwise the view will be considered complete when all active markers are ended.


#### Monitor digest cycle

```
perfMonitor.monitorDigest($rootScope)
```

Wraps the digest cycle with a marker named $digest.  This is a somewhat risky activity as angular likes its digest cycle.  So, ensure a reasonable reportThreshold is set.  

Also, sending the http GET report kicks off a digest cycle so it temporarily disables monitoring while sending the report to avoid an infinite loop.  


Options
-------

#### logMetrics
```
logMetrics: true
```

The logMetrics boolean determines whether the performance metrics should be logged to the browser's console.


#### reportThreshold

```
reportThreshold: 10
```

The reportThreshold number is used to determine whether a metric is worth reporting.  Default is 10 milliseconds.

#### beaconUrl

```
beaconUrl: undefined
```

The beaconUrl is used to determine whether and where to send the metrics via a HTTP GET.

#### enabled

```
enabled: true
```

The enabled boolean is used to enable or disable the service.  This is intended to allow the markers to stay in the code without having any performance impact when not desired.


#### reportOnEndView

```
reportOnEndView: false
```

The reportOnEndView boolean determines the behavior for reporting.  If true, reports are generated when endView() is called.  If false, reports are generated when the last active marker is ended.
 