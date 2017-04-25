# EMP3 Validation Tool

This validation tool is designed to test individual calls on the different map engines supported by EMP3.
It also has a mechanism for running raw JavaScript code.

It is written using [React](https://facebook.github.io/react/) and JSX style JavaScript.

## Using the client
Maps and created objects do not persist between page refreshes so pressing **F5** will clear the validation tool.

Results and outputs do persist as do scripts stored in the app.  Results may be accessed by the *Results* button at the top
right of the page. There is a limit of 1000 results before older results are overwritten.  

### Exporting Results

Open the results modal and press the *Export* button to save a JSON file of the output.

## Running the validation client

### Configuration
The configuration of the validation app is controlled by a `config.json` file found in `src/validation`
 
The entry page, `index.html`, is a generated file and must be created by running the appropriate Grunt script, described below. 

### Developer Mode
From the console run:

    npm install
    grunt serve

Open a browser to [localhost:3000/src/validation](http://localhost:3000/src/validation)

### Release Mode

    npm install
    grunt release
    
Copy the WAR file from `dist/wars` and deploy them to Tomcat or another web server application.
Open a browser to [localhost:8080/emp3-validation/index.html](http://localhost:8080/emp3-validation/index.html)

Adjust the paths according to your specific deployment.

## Scripting

Scripts may be run in the FreeformScript Runner within the validation app. Scripts may be named and saved within the app 
and will be preserved between loads, within the same browser. 

### Commands and Native Variables

#### Accessing Maps
Maps are are identified directly and do not need to be queried.  They are identified in a right to left, top to bottom pattern
    
    
    -----------
    |map0|map1|
    |---------|
    |map2|map3|
    -----------

Maps are always created sequentially.

```javascript
map0.addOverlay({
  overlay: new emp3.api.Overlay({geoId: 'firstOverlay'}),
  onSuccess: function() {
    toastr.info('Overlay Added to Map0');
  }
});

map2.setFreehandStyle({
  initialStyle: {
    strokeColor: {
      red: 255,
      green: 0,
      blue: 0
    },
    strokeWidth: 10
  }
}); 
```

#### Storing and Retrieving Features and Overlays
Features and overlays that are created or manipulated must be added to the validation app. Adding a feature to an EMP
 object will not automatically register it with the application for access between scripts.  

```javascript
this.props.addFeature(<emp3.api.Feature>); // Stores created features in the app itself for reference
this.props.addOverlay(<emp3.api.Overlay>); // Stores created overlays in the app itself for reference

var overlay = _.find(this.props.overlays, {geoId: 'testOverlay'}); // Attempt to locate the overlay
if (!overlay) {
  overlay = new emp3.api.Overlay({geoId: 'testOverlay'}); // Create the overlay
  this.props.addOverlay(overlay); // Store the overlay
}

var circle = _.find(this.props.features, {geoId: 'testCircle'}); // Attempt to locate the feature
if (!circle) {
  circle = new emp3.api.Circle({geoId: 'testCircle'}); // Create the feature
  this.props.addFeature(circle); // Store the feature 
}
````

#### Storing Results

To store results invoke the calls

```javascript
this.props.addResult(object, 'title') // Stores a result
this.props.addError(object, 'title') // Stores an error
```

To remore results
```javascript
this.props.clearResults() // Clears all results and errors from the log
```
*NOTE: There is a limit of 1000 results before older results are overwritten*

### Available Libraries
* [toastr](http://codeseven.github.io/toastr/)
* [lodash](https://lodash.com/)
