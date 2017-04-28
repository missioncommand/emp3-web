/* expected input format
 var e.data = {};
 e.data.id = "ID";
 e.data.name = "Name";
 e.data.description = "description";
 e.data.symbolID = "SFGPU----------";//A 15 character symbolID corresponding to one of the graphics in the MIL-STD-2525C
 e.data.points = controlPoints4;//like "66.26700036208742,30.62755038706961 66.27555681517738,30.64727776502703 66.25654247497746,30.64632704801704","x1,y1[,z1] [xn,yn[,zn]]...".
 e.data.altMode = "absolute";//for 3D
 e.data.scale = scale4;//for 3D like 50000.0; a number corresponding to how many meters one meter of our map represents. A value "50000" would mean 1:50K which means for every meter of our map it represents 50000 meters of real world distance.
 e.data.bbox = bbox4;//like "66.25,30.60,66.28,30.65";"lowerLeftX,lowerLeftY,upperRightX,upperRightY."
 e.data.modifiers = modifiers;
 e.data.format = format;//0 for KML, 2 for GeoJSON, 6 for GeoSVG
 e.data.pHeight = pixelHeight;//for 2D
 e.data.pWidth = pixelWidth;//for 2D
 e.data.converter  = {} optional converter object for custom geoToPixel Conversion
 e.data.fontInfo = {} required for SVG format only.  Get from RendererSettings.getMPFontInfo();
 */

/* return object for KML or GeoJSON
 {
 id:e.data.id,//same as what was passed in
 result:strOutput,//resultant kml,json or error message
 format:e.data.format//format number or "ERROR" if there was a problem like missing required parameters
 }
 */
/* return object for SVG
 {
 id:e.data.id,//same as what was passed in
 result:{svg:dataURI,geoTL:{x,y}, geoBR:{x,y}, wasClipped:true/false, bounds:{x,y,width,height}}
 format:e.data.format//format number or "ERROR" if there was a problem like missing required parameters
 }
 */


/* expected input format for batch
 var e.data = {};
 e.data.altMode = "absolute";//for 3D
 e.data.scale = scale4;//for 3D like 50000.0;  a number corresponding to how many meters one meter of our map represents. A value "50000" would mean 1:50K which means for every meter of our map it represents 50000 meters of real world distance.
 e.data.bbox = bbox4;//like "66.25,30.60,66.28,30.65";"lowerLeftX,lowerLeftY,upperRightX,upperRightY."
 e.data.format = format;//0 for KML, 2 for GeoJSON, 6 for GeoSVG
 e.data.pHeight = pixelHeight;//for 2D
 e.data.pWidth = pixelWidth;//for 2D
 e.data.converter = {} optional converter object for custom geoToPixel Conversion
 e.data.fontInfo = {} required for SVG format only.  Get from RendererSettings.getMPFontInfo();
 //format for individual batch item acts as an override to the e.data.format value
 e.data.batch = [{id:"ID",name:"name",description:"description","format":format,symbolID:"GFTPL-----****X",points:controlPoints,symStd:symStd,modifiers:{ModifiersTG.T_UNIQUE_DESIGNATION_1:"T",MilStdAttributes.LineColor:"#00FF00"}}];

 */

/* return objects for batch
 {
 //KML
 [{id:batch.id,symbolID:symbolID,kml:"kml string"}]
 //GeoJSON
 [{id:batch.id,symbolID:symbolID,geojson:"geojson string"]
 //SVG
 [{id:batch.id,symbolID:symbolID,svg:dataURI,geoTL:geoCoordTL, geoBR:geoCoordBR, wasClipped:wasClipped}]
 }
 */


//GeoCanvas doesn't work in a web worker due to its need for the DOM.
importScripts('savm-bc.min.js');//for strictly KML, GeoJSON and SVG(with hatch line and metoc fills, but no symbol fills)
//importScripts('savm-bc.js');//for strictly KML, GeoJSON and SVG(with hatch line and metoc fills, and symbol fills)

importScripts('Cesium.js');
//importScripts('workerImports.js');

var rendererMP = sec.web.renderer.SECWebRenderer;

armyc2.c2sd.renderer.utilities.ErrorLogger = {};
armyc2.c2sd.renderer.utilities.ErrorLogger.LogMessage = function (sourceClass, sourceMethod, message)
{
    throw {message: (sourceClass + "-" + sourceMethod + ": " + message)}
};
armyc2.c2sd.renderer.utilities.ErrorLogger.LogWarning = function (sourceClass, sourceMethod, message, level)
{
    throw {message: (sourceClass + "-" + sourceMethod + ": " + message)}
};
armyc2.c2sd.renderer.utilities.ErrorLogger.LogException = function (sourceClass, sourceMethod, err, level)
{
    var strMessage = (sourceClass + "." + sourceMethod + "(): " + err.message);
    var myStack = "";
    if (err.stack !== undefined)
    {
        myStack = err.stack;
    }

    if (!(myStack))
    {
        if (err.filename && err.lineno)
        {
            myStack = err.filename + " @ line# " + err.lineno;
        }
    }
    strMessage += "\n" + myStack;
    err.message += "\n" + myStack;
    throw strMessage;
    //throw {message:strMessage,error:err, stack:myStack};
};


var window = {};
var console = {};
console.log = console.log || function ()
{};
console.info = console.info || function ()
{};
console.warn = console.warn || function ()
{};
console.error = console.error || function ()
{};
window.console = console;

var document = {};

var _converter = null;

/*
 buildFrustum = function(frustum)
 {
 var result = new PerspectiveFrustum();

 result.aspectRatio = frustum.aspectRatio;
 result.fov = frustum.fov;
 result.near = frustum.near;
 result.far = frustum.far;

 // force update of clone to compute matrices
 result._aspectRatio = undefined;
 result._fov = undefined;
 result._near = undefined;
 result._far = undefined;

 result._offCenterFrustum = buildOffCenterFrustum(frustum._offCenterFrustum);

 return result;
 }
 }

 buildOffCenterFrustum = function(ocFrustum)
 {

 var result = new PerspectiveOffCenterFrustum();

 result.right = ocFrustum.right;
 result.left = ocFrustum.left;
 result.top = ocFrustum.top;
 result.bottom = ocFrustum.bottom;
 result.near = ocFrustum.near;
 result.far = ocFrustum.far;

 // force update of clone to compute matrices
 result._left = undefined;
 result._right = undefined;
 result._top = undefined;
 result._bottom = undefined;
 result._near = undefined;
 result._far = undefined;

 return result;
 }*/

saveCamera = function (camera)
{
    var save = {};
    save.position = {x: camera.position.x, y: camera.position.y, z: camera.position.z};
    save.heading = camera.heading;
    save.picth = camera.pitch;
    save.roll = camera.roll;
    save.transform = [];//Cesium.Matrix4.clone(camera.transform, camera.transform);

    save.transform[0] = camera.transform[0];
    save.transform[1] = camera.transform[1];
    save.transform[2] = camera.transform[2];
    save.transform[3] = camera.transform[3];
    save.transform[4] = camera.transform[4];
    save.transform[5] = camera.transform[5];
    save.transform[6] = camera.transform[6];
    save.transform[7] = camera.transform[7];
    save.transform[8] = camera.transform[8];
    save.transform[9] = camera.transform[9];
    save.transform[10] = camera.transform[10];
    save.transform[11] = camera.transform[11];
    save.transform[12] = camera.transform[12];
    save.transform[13] = camera.transform[13];
    save.transform[14] = camera.transform[14];
    save.transform[15] = camera.transform[15];

    return save;

};

//loadCamera = function(camera, save)
//{
//    /*camera.position = new Cesium.Cartesian3(save.position.x,save.position.y,save.position.z);
//    camera.heading = save.heading;
//    camera.pitch = save.pitch;
//    camera.roll = save.roll;*/
//    camera.transform = new Cesium.Matrix4(save.transform[0], save.transform[1], save.transform[2], save.transform[3],
//                           save.transform[4], save.transform[5], save.transform[6], save.transform[7],
//                           save.transform[8], save.transform[9], save.transform[10], save.transform[11],
//                           save.transform[12], save.transform[13], save.transform[14], save.transform[15]);
//
//    camera.setView({
//    destination : new Cesium.Cartesian3(save.position.x,save.position.y,save.position.z),
//    orientation: {
//        heading : save.heading, // east, default value is 0.0 (north)
//        pitch : save.pitch,    // default value (looking down)
//        roll : save.roll                             // default value
//    }
//});
//
//    return camera;
//}




loadCamera = function (camera, save)
{

    /*camera.position = new Cesium.Cartesian3(save.position.x,save.position.y,save.position.z);

     camera.heading = save.heading;

     camera.pitch = save.pitch;

     camera.roll = save.roll;*/

    camera.transform = new Cesium.Matrix4(save.transform[0], save.transform[1], save.transform[2], save.transform[3],
            save.transform[4], save.transform[5], save.transform[6], save.transform[7],
            save.transform[8], save.transform[9], save.transform[10], save.transform[11],
            save.transform[12], save.transform[13], save.transform[14], save.transform[15]);





    camera.setView({
        destination: new Cesium.Cartesian3(save.position.x, save.position.y, save.position.z),
        orientation: {
            heading: 0, // east, default value is 0.0 (north)

            pitch: Cesium.Math.toRadians(-90), // default value (looking down)

            roll: 0.0                             // default value

        }

    });



    return camera;

};




makeFakeScene = function ()
{
    var scene = {};
    scene.drawingBufferWidth = 751;//sceneInfo.drawingBufferWidth;
    scene.drawingBufferHeight = 583;//sceneInfo.drawingBufferHeight;
    scene.canvas = {};
    scene.canvas.clientWidth = 751;//sceneInfo.canvasClientWidth;
    scene.canvas.clientHeight = 583;//sceneInfo.canvasClientHeight;
    scene.frameState = {};
    scene.frameState.mode = 3;//{morphTime:1,name:"SCENE3D",value:2};//sceneInfo.frameState.mode;
    scene.frameState.morphTime = 1;//sceneInfo.frameState.morphTime;


    var ellipsoid = new Cesium.Ellipsoid(6378137, 6378137, 6356752.314245179);
    scene.mapProjection = new Cesium.WebMercatorProjection(ellipsoid);
    scene.frameState.mapProjection = scene.mapProjection;

    scene.camera = new Cesium.Camera(scene);

    //scene.camera = loadCamera(scene.camera, cameraInfo);
    //set camera values:
    scene.camera.position = new Cesium.Cartesian3(0, -14261947.901806576, 7130973.950903288);
    scene.camera.direction = new Cesium.Cartesian3(0, 0.8944271909999159, -0.4472135954999579);
    scene.camera.up = new Cesium.Cartesian3(0, 0.4472135954999579, 0.8944271909999159);
    scene.camera.frustum.fov = Cesium.Math.PI_OVER_THREE;
    scene.camera.frustum.near = 1;
    scene.camera.frustum.far = 5000000000;

    /*    camera.transform = new Cesium.Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);


     camera.setView({
     destination : new Cesium.Cartesian3(0,-14261947.901806576,7130973.950903288),
     orientation: {
     heading : save.heading, // east, default value is 0.0 (north)
     pitch : save.pitch,    // default value (looking down)
     roll : save.roll                             // default value
     }*/

    return scene;
};

/**
 *
 * sceneInfo:
 * @param {any} drawingBufferWidth
 * @param {any} drawingBufferHeight
 * @param {any} canvasClientWidth
 * @param {any} canvasClientHeight
 * @param {any} mapProjectionEllipsoid {x:x,y:y,z:z}
 * cameraInfo:
 * see saveCamera for properties needed
 */
buildFakeScene = function (sceneInfo, cameraInfo)
{
    var scene = {};
    scene.drawingBufferWidth = sceneInfo.drawingBufferWidth;
    scene.drawingBufferHeight = sceneInfo.drawingBufferHeight;
    scene.canvas = {};
    scene.canvas.clientWidth = sceneInfo.canvasClientWidth;
    scene.canvas.clientHeight = sceneInfo.canvasClientHeight;
    scene.frameState = {};
    scene.frameState.mode = sceneInfo.frameState.mode;
    scene.frameState.morphTime = sceneInfo.frameState.morphTime;
    //scene.mapProjection = ?;//need to clone ellipsoid from projection to make new projection
    var radii = sceneInfo.mapProjectionEllipsoid._radii;
    var ellipsoid = new Cesium.Ellipsoid(radii.x, radii.y, radii.z);

    /*
     if(3D)
     WebMercatorProjection//The map projection used by Google Maps, Bing Maps, and most of ArcGIS Online, EPSG:3857.
     else if (2D)
     GeographicProjection//A simple map projection where longitude and latitude are linearly mapped to X and Y by multiplying them by the {@link Ellipsoid#maximumRadius}.
     */
//    scene.mapProjection = new Cesium.WebMercatorProjection(ellipsoid);
    scene.mapProjection = new Cesium.GeographicProjection(ellipsoid);
    scene.frameState.mapProjection = scene.mapProjection;

    scene.camera = new Cesium.Camera(scene);
    scene.camera = loadCamera(scene.camera, cameraInfo);
    return scene;
};

getConverter = function (scene, camera)
{
    var converter = null;
    try
    {
        converter =
        {
            normalize: false,
            //required interface
            /**
             *
             * @param {type} coord must accept type armyc2.c2sd.graphics2d.Point2D
             * @returns {armyc2.c2sd.graphics2d.Point2D} must return type armyc2.c2sd.graphics2d.Point2D
             */
            GeoToPixels: function (coord)
            {
                var position = Cesium.Cartesian3.fromDegrees(coord.x, coord.y);
                var result = new Cesium.Cartesian2(0, 0);
                var cart3 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, position, result);
                //you need to return armyc2.c2sd.graphics2d.Point2D
                var pt2d = new armyc2.c2sd.graphics2d.Point2D(result.x, result.y);
                return pt2d;
            },
            //required interface
            /**
             *
             * @param {type} pixel  must accept type armyc2.c2sd.graphics2d.Point2D
             * @returns {undefined} must return type armyc2.c2sd.graphics2d.Point2D
             */
            PixelsToGeo: function (pixel)
            {
                var position = camera.pickEllipsoid(pixel);
                var cartographicPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
                var longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
                var latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
                //you need to return armyc2.c2sd.graphics2d.Point2D
                var pt2d = new armyc2.c2sd.graphics2d.Point2D(longitude, latitude);
                if (pt2d.x > 600 || pt2d.x < -600)
                    var foo = 1;
                return pt2d;
            },
            //required interface takes a boolean
            /**
             *
             * @param {type} accepts a boolean
             * @returns {undefined}
             */
            set_normalize: function (n)
            {
                this.normalize = n;
            }
        };
    }
    catch (err)
    {
        throw err;
    }
    return converter;
};

testConverter = function (converter, points)
{
    try
    {
        var point = {x: 66.26700036208742, y: 30.62755038706961};
        var result = converter.GeoToPixels(point);
    }
    catch (err)
    {
        throw err;
    }
    return result;
};

onmessage = function (e)
{
    var output = null;
    var converter = null;
    var fontInfo = null;
    var oldFont = null;
    var format = ["kml", "json", "geojson", "", "", "", "svg", "svg"];

    if (e.data.fontInfo)
    {
        fontInfo = e.data.fontInfo;
        oldFont = {};
        oldFont.name = armyc2.c2sd.renderer.utilities.RendererSettings.getMPModifierFontName();
        oldFont.size = armyc2.c2sd.renderer.utilities.RendererSettings.getMPModifierFontSize();
        oldFont.style = armyc2.c2sd.renderer.utilities.RendererSettings.getMPModifierFontStyle();
        //oldFont.kmlScale = armyc2.c2sd.renderer.utilities.RendererSettings.getKMLLabelScale();
        armyc2.c2sd.renderer.utilities.RendererSettings.setMPModifierFont(fontInfo.name, fontInfo.size, fontInfo.style, null, fontInfo);//name, size, style, scale
    }



    if (e.data && e.data.batch && e.data.batch.length > 0)
    {
        var result = null;
        var len = e.data.batch.length;
        var items = e.data.batch;
        var temp = null;
        //output = new Array(len);
        output = [];
        try
        {


            for (var i = 0; i < len; i++)
            {
                item = items[i];
                var format = -1;
            if (item.format)
                format = item.format;
            else if (e.data.format)
                format = e.data.format;

                if (e.data.altMode)
                {
                    if (e.data.converter)
                        converter = e.data.converter;
                    else if (e.data.sceneInfo && e.data.cameraInfo)
                    {
                        var scene = buildFakeScene(e.data.sceneInfo, e.data.cameraInfo);
                        converter = getConverter(scene, scene.camera);
                    }//*/
                    /*var scene = makeFakeScene();
                     converter = getConverter(scene, scene.camera);
                     var test = testConverter(converter, item.points);//*/



                    //data for symbol on 3d map so call RenderSymbol
                    result = rendererMP.RenderSymbol(item.id, item.name, item.description, item.symbolID, item.points, e.data.altMode, e.data.scale, e.data.bbox, item.modifiers, format, item.symstd, converter, fontInfo);
                }
                else
                {
                    //data for symbol on 2D map so call RenderSymbol2D
                    result = rendererMP.RenderSymbol2D(item.id, item.name, item.description, item.symbolID, item.points, e.data.pixelWidth, e.data.pixelHeight, e.data.bbox, item.modifiers, format, item.symstd, fontInfo);
                }
                if (result)
                {
                    if (format === 6 || format === 7)//SVG
                    {
                        result.id = item.id;
                        result.symbolID = item.symbolID;
                        //output[i] = result;
                        output.push(result);
                    }
                    else//KML or GeoJSON return string
                    {
                        temp = {id: item.id, symbolID: item.symbolID}
                        temp[format[format]] = result;
                        output.push(temp);
                    }
                }
            }
        }
        catch (err)
        {
            throw(err);
        }
        //[{id:batch.id,symbolID:symbolID,svg:dataURI,geoTL:geoCoordTL, geoBR:geoCoordBR, wasClipped:wasClipped}]
    }
    else if (e.data)
    {
        if (e.data.altMode)
        {
            if (e.data.converter)
                converter = e.data.converter;
            else if (e.data.sceneInfo && e.data.cameraInfo)
            {
                var scene = buildFakeScene(e.data.sceneInfo, e.data.cameraInfo);
                converter = getConverter(scene, scene.camera);
            }
            //data for symbol on 3d map so call RenderSymbol
            output = rendererMP.RenderSymbol(e.data.id, e.data.name, e.data.description, e.data.symbolID, e.data.points, e.data.altMode, e.data.scale, e.data.bbox, e.data.modifiers, e.data.format, e.data.symstd, converter, fontInfo);
        }
        else
        {
            //data for symbol on 2D map so call RenderSymbol2D
            output = rendererMP.RenderSymbol2D(e.data.id, e.data.name, e.data.description, e.data.symbolID, e.data.points, e.data.pixelWidth, e.data.pixelHeight, e.data.bbox, e.data.modifiers, e.data.format, e.data.symstd, fontInfo);
        }
    }

    if (fontInfo)
    {
        armyc2.c2sd.renderer.utilities.RendererSettings.setMPModifierFont(oldFont.name, oldFont.size, oldFont.style);//name, size, style, scale
    }

    if (e.data.batch)
    {
        postMessage({result: output, format: e.data.format});
    }
    else
    {
        if (output && output.substring)//kml or geojson
        {
            //return results
            var format = e.data.format;
            if (output.substring(0, 15) === '{"type":"error"')
            {
                format = "ERROR";
            }
            postMessage({id: e.data.id, result: output, format: format});

        }
        else if (output)//SVG
        {
            postMessage({id: e.data.id, result: output, format: format});
        }
    }

};
