// Create a new EMP emp3.api.Map instance.  EMP allows for multiple, uniquely addressable map instances to be on same web page.  Overlays and features can be added to multiple maps and their state will be mirrored on both map instances as a shared reference
var map1 = new emp3.api.Map({
  // Container should match the id of a DIV on the page where the EMP map instance will display.  EMP allows multiple map instances to run on the same page and each instance needs to be in a separate DIV
  // NOTE: Container is the ID of a DIV that already exists on the page where this example script will execute
  container: "empMapInstance",
  // Here you must specify an EMP engine. Currently EMP support Cesium, Leaflet, and is adding support for NASA World Wind Web.
  // The engineBasePath is relative to the HTML file using the EMP API.  If you place the emp3 folder in the same folder as you html file, the paths in this example will work for you
  engine: {
    engineBasePath: "emp3/emp3-cesium",
    mapEngineId: "cesium"
  },
  onSuccess: function() {
    // Here you receive an event that the EMP map instance is ready to be used.  This can take a while especially the first time an engine is loaded.  If the engine is used in the application more than once, it is only loaded once and is faster for additional instance.  If the resources get cached by browser, then this will also make future loading faster as well
    console.log("Map creation success.");
    // define a new WMTS service
    var wmts = new emp3.api.WMTS({
      url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS',
      name: 'ESRI World imagery',
      description: 'World Wide Satellite Imagery provided by ArcGIS Online',
      layer: 'World_Imagery'
    });

    // note: map1 needs to be changed to whatever your instance of emp3.api.Map is
    map1.addMapService({
      mapService: wmts,
      onSuccess: function() {
        // callbacks or notification of complete
      }
    });
    // Now that the map instance is ready, execute the example code
    runExample();

  },
  onError: function(args) {
    // Here you receive an event if any errors occurred while initializing the map instance
    console.log("Map creation failed.");
  }
});

// Preserve the map for clearing between tests
this.map = map1;