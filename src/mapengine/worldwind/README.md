# EMP3 NASA WebWorldWind
[WorldWind Documentation](https://webworldwind.org/) | [WorldWind Official Repo](https://github.com/NASAWorldWind/WebWorldWind) 

For inclusion in a config file

    engines: [
        {
            "engineBasePath": "https://path/to/worldwind/",
            "mapEngineId": "worldWindMapEngine",
            "properties": {
                "debug": false
                "layers": {
                    "controls" : false,
                    "compass" : false,
                    "coordinates" : true
                }
            } 
    ]
    
## Unit Tests
PhantomJS does not support Float64 so tests must be run in the browser. 

To run the unit tests open in a browser `test/index.html`
