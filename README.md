angular-apm  
==============

Service to set performance markers and report via browser console or HTTP GET to beacon

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
```markers=["$digest:2", "Controller2:329", "$digest:3", "Controller1:402", "$digest:1", "Controller3:8766"] ```

Usage
-----

See example/js/app.js,  will document in the near future.


Options
-------

#### logMetrics
```
logMetrics: true
```

The logMetrics boolean detemines whether the performance metrics should be logged to the browser's console.


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

TODO
----

- explicit start and stop instead of relying on being done when there are no 
- karma unit tests
