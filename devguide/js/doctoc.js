/**
 * This file contains the table of contents for the interactive style guide
 * All paths are relative to the root of the web application as it is used in index.html
 */

var doctoc = [{
  title: "Introduction",
  key: "pages/introduction.html"
}, {
  key: "pages/web-quickstart.html",
  title: "Quickstart"
}, {
  key: "docs/index.html",
  title: "API Docs",
  external: true

}, {
  title: "Examples",
  expanded: true,
  key: "pages/api.html",
  children: [
    {
      key: "pages/mapBasics.html",
      title: "Map Basics",
      expanded: true,
      children: [
        {
          key: "pages/example.html?example=examples/adjust-camera.js",
          title: "Camera Manipulation"
        },
        {
          key: "pages/example.html?example=examples/map-setLookAt.js",
          title: "LookAts vs Cameras"
        },
        {
          key: "pages/example.html?example=examples/map-setVisibility.js",
          title: "Overlays"
        },
        {
          key: "pages/example.html?example=examples/create-point.js",
          title: "Draw a Point Icon"
        },
        {
          key: "pages/example.html?example=examples/map-draw.js",
          title: "Draw and Edit a Line"
        },
        {
          key: "pages/example.html?example=examples/map-zoomTo.js",
          title: "Zoom to a Feature"
        },
        {
          key: "pages/example.html?example=examples/map-selection.js",
          title: "Select Features"
        },
        {
          key: "pages/example.html?example=examples/map-addEventListener.js",
          title: "Event listeners"
        }
      ]
    },
    {
      key: "pages/milStdSymbology.html",
      title: "MilStd Symbology",
      expanded: true,
      children: [
        {
          key: "pages/example.html?example=examples/create-mil-icon.js",
          title: "Create a MIL-STD-2525 Icon"
        },
        {
          key: "pages/example.html?example=examples/create-mil-multipoint.js",
          title: "Create a MIL-STD-2525 Multi-point Feature"
        },
        {
          key: "pages/example.html?example=examples/edit-multipoint.js",
          title: "Draw and Edit Features"
        },
        {
          key: "pages/example.html?example=examples/update-mil-icon.js",
          title: "Update Existing MIL-STD-2525 Icon"
        },
        {
          key: "pages/example.html?example=examples/changing-mil-icon-appearance.js",
          title: "Change the appearance of  MIL-STD-2525 Icon"
        }
      ]
    },
    {
      key: "pages/mapServices.html",
      title: "Map Services",
      expanded: true,
      children: [
        {
          key: "pages/example.html?example=examples/map-addMapServiceWMTS.js",
          title: "Add a WMTS Service"
        },
        {
          key: "pages/example.html?example=examples/map-addMapService.js",
          title: "Add a WMS Service"
        }
      ]
    }
  ]
}];
