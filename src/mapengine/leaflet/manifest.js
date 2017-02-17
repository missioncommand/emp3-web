/* global emp, leafLet */

function initlializeLeaflet(args) {
    var engPath = args.engine.engineBasePath,
        oRetObject = {},
        empProxyURL = emp.util.config.getProxyUrl();

    function createLeafletInstance(args) {
        var strData = args.configProperties.data;
        var jsonData;
        var bUseProxy = false;
        var bUseProxyForDefautMap = false;
        var iMinLevel = 1;
        var iMaxLevel = 6;
        var sInitialMapUrl;
        var sMapID = emp.helpers.id.newGUID();
        var oMapProperties = {};

        // load JQuery in the emp namespace
        if ($ !== undefined) {
          emp.$ = $;
        }

        if (strData) {
            if (typeof strData === 'string') {
              strData = args.configProperties.data.replace(/'/g, '"');
              jsonData = JSON.parse(strData);
            } else if (typeof strData === 'object') {
              jsonData = strData;
            }

            if (jsonData) {
                if (jsonData.hasOwnProperty('Use_Proxy_For_Map_Request')) {
                    bUseProxy = Boolean(jsonData['Use_Proxy_For_Map_Request']);
                }

                if (jsonData.hasOwnProperty('Use_Proxy_For_Default_Map_Request')) {
                    bUseProxyForDefautMap = Boolean(jsonData['Use_Proxy_For_Default_Map_Request']);
                }

                if (jsonData.hasOwnProperty('Minimum_Zoom_Level')) {
                    if (typeof jsonData['Minimum_Zoom_Level'] === 'string') {
                        try {
                            iMinLevel = parseInt(jsonData['Minimum_Zoom_Level']);
                        } catch (e) {}
                    } else if (typeof jsonData['Minimum_Zoom_Level'] === 'number') {
                        iMinLevel = Math.round(jsonData['Minimum_Zoom_Level']);
                    }
                }

                if (jsonData.hasOwnProperty('Maximum_Zoom_Level')) {
                    if (typeof jsonData['Maximum_Zoom_Level'] === 'string') {
                        try {
                            iMaxLevel = parseInt(jsonData['Maximum_Zoom_Level']);
                        } catch (e) {}
                    } else if (typeof jsonData['Maximum_Zoom_Level'] === 'number') {
                        iMaxLevel = Math.round(jsonData['Maximum_Zoom_Level']);
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

        //true is the default
        emp.util.config.setAutoSelect(true);
        oMapProperties.minZoom = iMinLevel;
        oMapProperties.maxZoom = iMaxLevel;
        oMapProperties.coreId = sMapID;
        oMapProperties.objectType = leafLet.typeLibrary.objectType.LL_DEFAULT_MAP;
        oMapProperties.isDefaultMap = true;
        args.mapInstance.engine = new emp.engineDefs.leafletMapEngine({
            container: args.mapInstance.container.get(),
            tileLayer: {
                path: sInitialMapUrl,
                properties: oMapProperties
            },
            empProxyURL: (emp.helpers.isEmptyString(empProxyURL) ? undefined : emp.helpers.relToAbs(empProxyURL)),
            engineBasePath: engPath,
            useProxy: bUseProxy,
            useProxyForDefault: bUseProxyForDefautMap,
            mapInstance: args.mapInstance,
            initialExtent: args.extent,
            renderingOptimization: args.configProperties.renderingOptimization || false,
            midDistanceThreshold: args.configProperties.midDistanceThreshold,
            farDistanceThreshold: args.configProperties.farDistanceThreshold
        });
    }

    var resourceList = [
      "css/leaflet-eng.css",
      "css/leaflet.css",
      "css/MarkerCluster.css",
      "css/MarkerCluster.Default.css",
      "js/lib/leaflet-src.js",
      "js/lib/KML.js",
      "js/lib/leaflet.markercluster-src.js",
      "js/utils/emp.typeLibrary.utils.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.js",
      "js/lib/leaflet-eng.leaflet.extensions.js",
      "js/lib/KML.extensions.js",
      "js/lib/leaflet-eng.markerCluster.extensions.js",
      "js/lib/leaflet-eng.leaflet.extension.Ellipse.js",

      "js/typeLibrary/leaflet-eng.selectionManager.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.EmpBoundary.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.empObject.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.DisplayableObject.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.EmpClusterGroup.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.overlay.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.feature.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.feature.milstd.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.feature.kml.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.feature.geojson.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.feature.airspace.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.feature.image.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.feature.AOI.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.wms.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.milstdmodifiers.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.feature.text.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.feature.GeoRectangle.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.feature.GeoSquare.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.feature.GeoCircle.js",
      "js/typeLibrary/leaflet-eng.typeLibrary.feature.GeoEllipse.js",

      "js/utils/leaflet-eng.utils.js",
      "js/utils/leaflet-eng.utils.geoJson.js",
      "js/utils/leaflet-eng.utils.milstd.js",
      "js/utils/leaflet-eng.utils.kml.js",
      "js/utils/leaflet-eng.utils.airspace.js",
      "js/utils/leaflet-eng.utils.oval.js",
      "js/utils/leaflet-eng-renderer-PointConverter.js",

      "js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.attributes.js",
      "js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.cylinder.js",
      "js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.polygon.js",
      "js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.curtain.js",
      "js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.orbit.js",
      "js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.route.js",
      "js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.track.js",
      "js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.radarc.js",
      "js/typeLibrary/airspace/leaflet-eng.typeLibrary.airspace.polyarc.js",

      "js/editor/leaflet-eng.editor.controlpoint.js",
      "js/editor/leaflet-eng.editor.AbstractEditor.js",
      "js/editor/leaflet-eng.editor.GeoJson.js",
      "js/editor/leaflet-eng.editor.MilStd.js",
      "js/editor/leaflet-eng.editor.KML.js",
      "js/editor/leaflet-eng.editor.airspace.js",
      "js/editor/milstd/leaflet-eng.editor.milstd.dcautoshape.js",
      "js/editor/milstd/leaflet-eng.editor.milstd.dccircularautoshape.js",
      "js/editor/milstd/leaflet-eng.editor.milstd.dccircularrangefan.js",
      "js/editor/milstd/leaflet-eng.editor.milstd.dcline.js",
      "js/editor/milstd/leaflet-eng.editor.milstd.dcpolygon.js",
      "js/editor/milstd/leaflet-eng.editor.milstd.dcrectparamautoshape.js",
      "js/editor/milstd/leaflet-eng.editor.milstd.dcroute.js",
      "js/editor/milstd/leaflet-eng.editor.milstd.dcsectorparamautoshape.js",
      "js/editor/milstd/leaflet-eng.editor.milstd.dcsuperautoshape.js",
      "js/editor/milstd/leaflet-eng.editor.milstd.dctwopointline.js",
      "js/editor/milstd/leaflet-eng.editor.milstd.dctwopointrectas.js",
      "js/editor/milstd/leaflet-eng.editor.milstd.singlepoint.js",
      "js/editor/airspace/leaflet-eng.editor.airspace.curtain.js",
      "js/editor/airspace/leaflet-eng.editor.airspace.polygon.js",
      "js/editor/airspace/leaflet-eng.editor.airspace.cylinder.js",
      "js/editor/airspace/leaflet-eng.editor.airspace.orbit.js",
      "js/editor/airspace/leaflet-eng.editor.airspace.route.js",
      "js/editor/airspace/leaflet-eng.editor.airspace.track.js",
      "js/editor/airspace/leaflet-eng.editor.airspace.radarc.js",
      "js/editor/airspace/leaflet-eng.editor.airspace.polyarc.js",

      "js/leaflet-map-engine.debug.js"
    ];

    if (args.engine.properties && args.engine.properties.hasOwnProperty("debug") && args.engine.properties.debug === true) {
        if (!window.$) {
          resourceList.push("js/lib/leaflet/ThirdParty/jquery-1.11.2.min.js");
        }
        oRetObject = {
            resourceList: resourceList,
            fnCreateInstance: createLeafletInstance
        };
    } else {
        resourceList = [
          "emp3-leaflet.min.css",
          "emp3-leaflet.min.js"
        ];

        if (!window.$) {
          resourceList.push("js/lib/leaflet/ThirdParty/jquery-1.11.2.min.js");
        }
        oRetObject = {
            resourceList: resourceList,
            fnCreateInstance: createLeafletInstance
        };
    }
    return oRetObject;
}

emp.instanceManager.registerMapEngine({
    fnInitialize: initlializeLeaflet
});
