Extensible Map Platform 3 (EMP3) - Web SDK
===========
This project contains the EMP3 Map API, and Core SDK components as well as a map application with UI components leveraging the EMP SDK.


This project is built using Node.js and Grunt.  If you do not have node on your system, please install node (5.0 or later) following instructions at [Node.js](http://nodejs.org/)

Once Node.js is installed navigate to the root of the EMP3 project, open a command prompt and run:
```bash
npm install -g grunt-cli
npm install
```

This will install the Node.js dependencies for this project.

For default build (developer quick build - unit tests, code linting, and minification) run:
```bash
grunt
```
This will run the Grunt tasks which include unit tests, code linting, and minification for the distribution files for the emp3-web-sdk.

For release build (includes developer quick build outputs plus JSDocs, zipped outputs, and WAR file for map application) run:
```bash
grunt release
```

All outputs will appear in the "dist" folder
The dist folder is removed automatically for each build

## Common Grunt Tasks

|Task |description|
|:-----|:-----------|
|`default`| default Grunt build; generates uglified output and docs but no wars or zips |
|`release` | cleans and builds all documentation, minified files, zips, and wars|
|`jsdoc`| generates JSDocs to `dist/doc` | 
|`clean`| removes dist folder and contents|
|`test`| runs unit tests|
|`serve`| runs the development server (see below for additional details)| 

## Unit Tests

### Using Grunt

To Test the *debug* versions of the library
```bash
grunt test
```

To Test the *minified* version of the library
```bash
grunt
grunt testRelease
```

### From the browser

Invoke the *debug* or *minified* test command first (see above)


Then to view the unit tests in a browser launch the file.

```bash
test/index.html
```
from the browser you want to test in.

## Development Validation Tool

To run the validation tool locally run

```bash
npm install
grunt serve
```

Then open a browser to [localhost:3000/src/validation/](http://localhost:3000/src/validation/)

* If changes are made to the validation tool it will reload automatically.
* If changes are made to the emp3 library reload the page

### Creating Additional Validation Tests
New tests should be created in `src/validation/js/components`

Register the new test with the manifest `src/validation/js/TestManifest.js`
