/*
this files containe the table of contents for the interactive style guide
All paths are relative to the root of the web application as it is used in index.html
*/

var doctoc = [{
    title: "Introduction",
    key: "pages/introduction.html"
}, {
    key: "pages/tryit.html",
    title: "Live Examples",
    expanded: true
}, {
        key: "pages/web-quickstart.html",
        title: "Quickstart",
        expanded: true
    }, {
        key: "docs/index.html",
        title: "API Docs",
        frame: true,
        expanded: true

},{
    title: "API Highlights",
    expanded: true,
    key: "pages/api.html",
    children: [{
        key: "pages/map.html",
        web: "/web/emp3.api.Map.html",
        smart: "docs/android/mil/emp3/api/interfaces/IMap.html",
        title: "Map",
        expanded: true
    }, {
        key: "pages/overlays.html",
        web: "/web/emp3.api.Overlay.html",
        smart: "docs/android/mil/emp3/api/Overlay.html",
        title: "Overlay",
        expanded: true
    }, {
        key: "pages/symbols.html",
        web: "/web/emp3.api.MilStdSymbol.html",
        smart: "docs/android/mil/emp3/api/MilStdSymbol.html",
        title: "MIL-STD-2525 Symbols",
        expanded: true
    }, {
        key: "pages/point.html",
        web: "/web/emp3.api.Point.html",
        smart: "docs/android/mil/emp3/api/Point.html",
        title: "Point",
        expanded: true
    }, {
        key: "pages/path.html",
        web: "/web/emp3.api.Path.html",
        smart: "docs/android/mil/emp3/api/Path.html",
        title: "Path",
        expanded: true
    }, {
        key: "pages/polygon.html",
        web: "/web/emp3.api.Polygon.html",
        smart: "docs/android/mil/emp3/api/Polygon.html",
        title: "Polygon",
        expanded: true
    }, {
        key: "pages/circle.html",
        web: "/web/emp3.api.Circle.html",
        smart: "docs/android/mil/emp3/api/Circle.html",
        title: "Circle",
        expanded: true
    }, {
        key: "pages/ellipse.html",
        web: "/web/emp3.api.Ellipse.html",
        smart: "docs/android/mil/emp3/api/Ellipse.html",
        title: "Ellipse",
        expanded: true
    }, {
        key: "pages/square.html",
        web: "/web/emp3.api.Square.html",
        smart: "docs/android/mil/emp3/api/Square.html",
        title: "Square",
        expanded: true
    }, {
        key: "pages/rectangle.html",
        web: "/web/emp3.api.Rectangle.html",
        smart: "docs/android/mil/emp3/api/Rectangle.html",
        title: "Rectangle",
        expanded: true
    }, {
        key: "pages/acm.html",
        web: "/web/emp3.api.AirControlMeasure.html",
        smart: "docs/android/mil/emp3/api/AirControlMeasure.html",
        title: "Air Control Measure (ACM)",
        expanded: true

    }, {
        key: "pages/events.html",
        title: "Events",
        expanded: true/*,
        children: [{
            key: "pages/events.html",
            web: "/web/emp3.api.Map.html",
            smart: "docs/android/mil/emp3/api/interfaces/IMap.html",
            title: "Draw new feature"
        }]*/
    }, {
        key: "pages/workflows.html",
        title: "Workflows",
        expanded: true/*,
        children: [{
            key: "pages/draw-workflow.html",

            title: "Draw new feature"
        }, {
            key: "pages/edit-workflow.html",

            title: "Edit existing feature"
        }, {
            key: "pages/update-workflow.html",

            title: "Update existing feature"
        }]*/

    }]
}];
