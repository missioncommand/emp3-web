/* global emp, leafLet */

(function() {
    var engPath = "/";
    if (emp.appSetup.hasOwnProperty("engineBasePath") && !emp.helpers.isEmptyString(emp.appSetup.engineBasePath)) {
        engPath = emp.appSetup.engineBasePath;
    }
    
    var resourceList = [];
    var empProxyURL = emp.appSetup.urlProxy;

    function createLeafletInstance(args) {
        var strData = args.configProperties;
        var jsonData;
        var bUseProxy = false;
        var bUseProxyForDefautMap = false;
        var iMinLevel = 1;
        var iMaxLevel = 6;
        var sInitialMapUrl; // = emp.helpers.relToAbs("/emp-map-tiles/tiles/{z}/{x}/{y}.png");
        var sMapID = emp.helpers.id.newGUID();
        var oMapProperties = {};
        var mapInstance = {
            mapInstanceId: "xyz",
            eventing: {
                SelectionChange: function(args) {
                    new emp.map.eventing.SelectionChange(args);
                },
                ViewChange: function(args) {
                    new emp.map.eventing.ViewChange(args);
                },
                Pointer: function(args) {
                    new emp.map.eventing.Pointer(args);
                },
                SelectionBox: function(args) {
                    new emp.map.eventing.SelectionBox(args);
                },
                StaticContent: function(oLayerList) {
                    new emp.map.eventing.StaticContent(oLayerList);
                },
                Error: function(args) {
                    new emp.map.eventing.Error(args);
                },
                StatusChange: function(args) {
                    new emp.map.eventing.StatusChange(args);
                },
                DrawStart: function(args) {
                    new emp.map.eventing.DrawStart(args);
                },
                DrawEnd: function(args) {
                    new emp.map.eventing.DrawEnd(args);
                },
                EditStart: function(args) {
                    new emp.map.eventing.EditStart(args);
                },
                EditEnd: function(args) {
                    new emp.map.eventing.EditEnd(args);
                }
            }
        };

        if (strData) {
            jsonData = strData;//JSON.parse(strData);

            if (jsonData) {
                if (jsonData.hasOwnProperty('Use_Proxy_For_Map_Request')) {
                    if (typeof jsonData['Use_Proxy_For_Map_Request'] === 'string') {
                        bUseProxy = (jsonData['Use_Proxy_For_Map_Request'].toLowerCase() === 'true')? true: false;
                    }
                    else if (typeof jsonData['Use_Proxy_For_Map_Request'] === 'boolean') {
                        bUseProxy = jsonData['Use_Proxy_For_Map_Request'];
                    }
                }

                if (jsonData.hasOwnProperty('Use_Proxy_For_Default_Map_Request')) {
                    if (typeof jsonData['Use_Proxy_For_Default_Map_Request'] === 'string') {
                        bUseProxyForDefautMap = (jsonData['Use_Proxy_For_Default_Map_Request'].toLowerCase() === 'true')? true: false;
                    }
                    else if (typeof jsonData['Use_Proxy_For_Default_Map_Request'] === 'boolean') {
                        bUseProxyForDefautMap = jsonData['Use_Proxy_For_Default_Map_Request'];
                    }
                }

                if (jsonData.hasOwnProperty('Minimum_Zoom_Level')) {
                    if (typeof jsonData['Minimum_Zoom_Level'] === 'string') {
                        try {
                            iMinLevel = parseInt(jsonData['Minimum_Zoom_Level']);
                        }
                        catch(e){}
                    }
                    else if (typeof jsonData['Minimum_Zoom_Level'] === 'number') {
                        iMinLevel = Math.round(jsonData['Minimum_Zoom_Level']);
                    }
                }

                if (jsonData.hasOwnProperty('Maximum_Zoom_Level')) {
                    if (typeof jsonData['Maximum_Zoom_Level'] === 'string') {
                        try {
                            iMaxLevel = parseInt(jsonData['Maximum_Zoom_Level']);
                        }
                        catch(e){}
                    }
                    else if (typeof jsonData['Maximum_Zoom_Level'] === 'number') {
                        iMinLevel = Math.round(jsonData['Maximum_Zoom_Level']);
                    }
                }

                if (emp.helpers.isEmptyString(jsonData['Default_Tile_Map_Server_URL'])) {
                    sInitialMapUrl = null;
                } else {
                    sInitialMapUrl = jsonData['Default_Tile_Map_Server_URL'];
                    sInitialMapUrl = emp.helpers.relToAbs(sInitialMapUrl);
                }
            }
        }

        oMapProperties.minZoom = iMinLevel;
        oMapProperties.maxZoom = iMaxLevel;
        oMapProperties.coreId = sMapID;
        oMapProperties.objectType = leafLet.typeLibrary.objectType.LL_DEFAULT_MAP;
        oMapProperties.isDefaultMap = true;

        emp.map.engine = emp.engineDefs.leafletMapEngine({
            container: emp.map.container.get(),
            tileLayer: {
                path: sInitialMapUrl,
                properties: oMapProperties
            },
            empProxyURL: (emp.helpers.isEmptyString(empProxyURL)? undefined: emp.helpers.relToAbs(empProxyURL)),
            engineBasePath: engPath,
            useProxy: bUseProxy,
            useProxyForDefault: bUseProxyForDefautMap,
            mapInstance: mapInstance,
            isV2Core: true
            //initialExtent: args.extent
        });
    }

    if (typeof (window.addResizeListener) !== 'function') {
        resourceList.push(engPath + "emp-engine-leaflet/js/v2CoreAddOns/elementResizeListener.js");
    }

    if ((emp.util === undefined) || (typeof (emp.util.isEmptyString) !== 'function')) {
        resourceList.push(engPath + "emp-engine-leaflet/js/v2CoreAddOns/emp.util.js");
    }

    if ((emp.util === undefined) || (emp.util.config === undefined)) {
        resourceList.push(engPath + "emp-engine-leaflet/js/v2CoreAddOns/emp.util.config.js");
    }

    if ((emp.utilities === undefined) || (emp.utilities.icon === undefined)) {
        resourceList.push(engPath + "emp-engine-leaflet/js/v2CoreAddOns/emp.utilities.js");
    }

    resourceList.push(engPath + "emp-engine-leaflet/js/v2CoreAddOns/emp.geoLibrary.fix.js");

    if (emp.hasOwnProperty("appSetup") &&
        emp.appSetup.hasOwnProperty("mode") &&
        emp.appSetup.mode === "debug") {

        resourceList.push(engPath + "emp-engine-leaflet/css/leaflet-eng.css");
        resourceList.push(engPath + "emp-engine-leaflet/css/leaflet.css");
        resourceList.push(engPath + "emp-engine-leaflet/css/MarkerCluster.css");
        resourceList.push(engPath + "emp-engine-leaflet/css/MarkerCluster.Default.css");
        resourceList.push(engPath + "emp-engine-leaflet/js/lib/leaflet-src.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/lib/KML.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/lib/leaflet.markercluster-src.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/utils/emp.typeLibrary.utils.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/lib/leaflet-eng.leaflet.extensions.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/lib/KML.extensions.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/lib/leaflet-eng.markerCluster.extensions.js");

        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.selectionManager.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.EmpBoundary.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.empObject.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.DisplayableObject.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.EmpClusterGroup.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.overlay.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.feature.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.feature.milstd.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.feature.kml.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.feature.geojson.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.feature.airspace.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.feature.image.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.feature.AOI.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.wms.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/leaflet-eng.typeLibrary.milstdmodifiers.js");

        resourceList.push(engPath + "emp-engine-leaflet/js/utils/leaflet-eng.utils.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/utils/leaflet-eng.utils.geoJson.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/utils/leaflet-eng.utils.milstd.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/utils/leaflet-eng.utils.kml.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/utils/leaflet-eng.utils.airspace.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/utils/leaflet-eng.utils.oval.js");

        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.attributes.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.cylinder.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.polygon.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.curtain.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.orbit.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.route.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.track.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.radarc.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.polyarc.js");

        resourceList.push(engPath + "emp-engine-leaflet/js/editor/leaflet-eng.editor.controlpoint.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/leaflet-eng.editor.AbstractEditor.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/leaflet-eng.editor.GeoJson.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/leaflet-eng.editor.MilStd.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/leaflet-eng.editor.KML.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/leaflet-eng.editor.airspace.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/milstd/leaflet-eng.editor.milstd.dcautoshape.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/milstd/leaflet-eng.editor.milstd.dccircularautoshape.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/milstd/leaflet-eng.editor.milstd.dccircularrangefan.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/milstd/leaflet-eng.editor.milstd.dcline.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/milstd/leaflet-eng.editor.milstd.dcpolygon.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/milstd/leaflet-eng.editor.milstd.dcrectparamautoshape.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/milstd/leaflet-eng.editor.milstd.dcroute.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/milstd/leaflet-eng.editor.milstd.dcsectorparamautoshape.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/milstd/leaflet-eng.editor.milstd.dcsuperautoshape.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/milstd/leaflet-eng.editor.milstd.dctwopointline.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/milstd/leaflet-eng.editor.milstd.dctwopointrectas.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/milstd/leaflet-eng.editor.milstd.singlepoint.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/airspace/leaflet-eng.editor.airspace.curtain.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/airspace/leaflet-eng.editor.airspace.polygon.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/airspace/leaflet-eng.editor.airspace.cylinder.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/airspace/leaflet-eng.editor.airspace.orbit.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/airspace/leaflet-eng.editor.airspace.route.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/airspace/leaflet-eng.editor.airspace.track.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/airspace/leaflet-eng.editor.airspace.radarc.js");
        resourceList.push(engPath + "emp-engine-leaflet/js/editor/airspace/leaflet-eng.editor.airspace.polyarc.js");

        resourceList.push(engPath + "emp-engine-leaflet/js/leaflet-map-engine.debug.js");
    } else {
        resourceList.push(engPath + "emp-engine-leaflet/min/emp3-leaflet.min.css");
        resourceList.push(engPath + "emp-engine-leaflet/min/emp3-leaflet.min.js");
    }

    emp.map.engines.loadResources({
        resourceList: resourceList,
        callback: createLeafletInstance
    });
    
    // We do this so the core does not timeout and think we have not loaded.
    emp.map.engine = {};
}());
  