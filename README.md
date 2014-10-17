angular-apm  
==============

Service to set performance markers 

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
git clone git@github.com:randith/angular-apm.git
cd angular-apm
npm -g install bower
npm -g install grunt
npm install
bower install
grunt
```

After this, go at ``127.0.0.1:9001/example`` in your browser, and you will see running example of ``angular-apm``.

Usage
-----



TODO
----

- make configurable beaconurl, logging
- explicit start and stop instead of relying on being done when there are no 
- karma unit tests
