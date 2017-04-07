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
//importScripts('svm-bc.js');//for strictly KML, GeoJSON and SVG(with hatch line and metoc fills, and symbol fills)

//importScripts('worldwind.js');
//importScripts('workerImports.js');
// test atom push. broiken again.
//test

var rendererMP = sec.web.renderer.SECWebRenderer;

armyc2.c2sd.renderer.utilities.ErrorLogger = {};
armyc2.c2sd.renderer.utilities.ErrorLogger.LogMessage = function (sourceClass, sourceMethod, message)
{
    throw {message: (sourceClass + "-" + sourceMethod + ": " + message)};
};
armyc2.c2sd.renderer.utilities.ErrorLogger.LogWarning = function (sourceClass, sourceMethod, message, level)
{
    throw {message: (sourceClass + "-" + sourceMethod + ": " + message)};
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



saveNavigator = function (navigator)
{
    var save = {};
    save.position = {x: this.worldWindow.navigator.lookAtLocation.longitude, y: this.worldWindow.navigator.lookAtLocation.latitude, z: this.worldWindow.navigator.range};
    save.heading = navigator.heading;
    save.picth = navigator.tilt;
    save.roll = navigator.roll;
    save.transform = [];//Cesium.Matrix4.clone(camera.transform, camera.transform);



    return save;

};


loadNavigator = function (navigator, save)
{

    /*camera.position = new Cesium.Cartesian3(save.position.x,save.position.y,save.position.z);

     camera.heading = save.heading;

     camera.pitch = save.pitch;

     camera.roll = save.roll;*/

  /*  camera.transform = new Cesium.Matrix4(save.transform[0], save.transform[1], save.transform[2], save.transform[3],
            save.transform[4], save.transform[5], save.transform[6], save.transform[7],
            save.transform[8], save.transform[9], save.transform[10], save.transform[11],
            save.transform[12], save.transform[13], save.transform[14], save.transform[15]);
            */

  navigator.lookAtLocation.latitude = save.latitude;// must be in degrees
  navigator.lookAtLocation.longitude = save.longitude;// must be in degrees

  //navigator.range = args.range;
  navigator.tilt = save.pitch;
  navigator.heading = save.heading;


    // camera.setView({
    //     destination: new Cesium.Cartesian3(save.position.x, save.position.y, save.position.z),
    //     orientation: {
    //         heading: 0, // east, default value is 0.0 (north)
    //
    //         pitch: Cesium.Math.toRadians(-90), // default value (looking down)
    //
    //         roll: 0.0                             // default value
    //
    //     }
    //
    // });



    return navigator;

};






getConverter = function (wwd)
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
                // vec3 cartesian
                var pointCartesian = wwd.globe.computePointFromPosition(coord.y, coord.x, 0); //lat lon alt , result
                //convert from cartesian( model coordinates)  to WebGL screen coordinates
                var screenCoordinates =  wwd.drawContext.navigatorState.project(pointCartesian, new Vec3(0, 0, 0));//pointCartesian is vec3
                //var position = Cesium.Cartesian3.fromDegrees(coord.x, coord.y);
                //var result = new Cesium.Cartesian2(0, 0);
                //var cart3 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, position, result);
                //you need to return armyc2.c2sd.graphics2d.Point2D
                var pt2d = new armyc2.c2sd.graphics2d.Point2D(screenCoordinates[0], screenCoordinates[1]);
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
               var  vec3 =  new Vec3(pixel.x, pixel.y);
              //convert from WebGL screen coordinates to cartesian( model coordinates)
                var cartesianCoordinates =  wwd.drawContext.navigatorState.unProject(vec3, new Vec3(0, 0, 0));//pointCartesian is vec3
                var position = wwd.globe.computePositionFromPoint (cartesianCoordinates.x,cartesianCoordinates.y, cartesianCoordinates.z, new WorldWind.Position(0,0,0) ); //Position (lat, lon, altitude)
                //var position = camera.pickEllipsoid(pixel);
                //var cartographicPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
                var longitude = Math.toDegrees(position.longitude);
                var latitude = Math.toDegrees(position.latitude);
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


onmessage = function (e)
{
    var output = null;
    var converter = null;
    var fontInfo = null;
    var oldFont = null;
    var formats = ["kml", "json", "geojson", "", "", "", "svg", "svg"];
    var format = -1;

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
                format = -1;
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
                        temp = {id: item.id, symbolID: item.symbolID};
                        temp[formats[format]] = result;
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
            //data for symbol on 2D map so call RenderSymbol2D
            output = rendererMP.RenderSymbol2D(e.data.id, e.data.name, e.data.description, e.data.symbolID, e.data.points, e.data.pixelWidth, e.data.pixelHeight, e.data.bbox, e.data.modifiers, e.data.format, e.data.symstd, fontInfo);
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
            format = e.data.format;
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
