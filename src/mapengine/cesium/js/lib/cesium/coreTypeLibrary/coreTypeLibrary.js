/*
 * The content of this file should be added to the emp-map core emp.typeLibrary.js file
 * so they can be used by all map engines.
 * 
 * The types and classes are defines as emp.typeLibrary.XXX.YYY so that if and when the
 * files are moved the code does not need to be updated.
 * 
 * Any type or class placed in this directory structure MUST NOT clash with anything
 * in the emp-map core project.
 */

/* global emp */

/**
 * @memberof emp.typeLibrary
 * @class
 * @description This class represent a coordinate object used in the CoordinateUpdate class
 */
emp.typeLibrary.LatLonCoordinates = function (args) {
    /**
     * @field
     * @type number
     * @description This property contains the latitude value of the coordiante.
     */
    this.lat = args.lat;
    /**
     * @field
     * @type number
     * @description This property contains the longitude value of the coordinate.
     */
    this.lon = args.lon;
    
    if (typeof (args.alt) === 'number')
    {
        /**
         * @field
         * @type number=
         * @description This property, if present, contains the altitude value of the coordinate if applicable.
         */
        this.alt = args.alt;
    }
};

/**
 * @memberof emp.typeLibrary
 * @class
 * @description This class represent the update data utilized in the draw and event update events.
 */
emp.typeLibrary.CoordinateUpdate = function (args) {
    /**
     * @field
     * @type emp.typeLibrary.CoordinateUpdateType
     * @description This property identifies 
     * the type of update. For ADD and UPDATE the indices identifies the coordinates
     * in the coordinates array that have been added or updates. For REMOVE the indices
     * array identifies the coordinates that have been removed from the coordinates array.
     */
    this.type = args.type;

    /**
     * @field
     * @type {number[]}
     * @description This property contains an array of indexes 
     * identifying the control points that are affected.
     */
    this.indices = args.indices;

    /**
     * @field
     * @type {LatLonCoordinates[]}
     * @description This property contains an 
     * array of all the feature coordinates {@link emp.typeLibrary.LatLonCoordinates}.
     */
    this.coordinates = args.coordinates;

    /**
     * @private
     * @method
     * @param {Array} oGeoJsonCoord This parameters must contain a single coordinate in GeoJson format.
     */
    this.geojsonCoordToLatLonCoordinates = function(oGeoJsonCoord)
    {
        var oLLCoord;
        
        if (oGeoJsonCoord.length > 2)
        {
            oLLCoord = new emp.typeLibrary.LatLonCoordinates({
                lat: oGeoJsonCoord[1],
                lon: oGeoJsonCoord[0],
                alt: oGeoJsonCoord[2]
            });
        }
        else
        {
            oLLCoord = new emp.typeLibrary.LatLonCoordinates({
                lat: oGeoJsonCoord[1],
                lon: oGeoJsonCoord[0]
            });
        }
        
        return oLLCoord;
    };
    
    /**
     * @method
     * @description This method will convert geojson coordiantes to {@link emp.typeLibrary.LatLonCoordinates}
     * and place the result in the coordinates field.
     * @param {object} oGeoJsonData This parameters must be a geojson simple object Point, LineString or Polygon.
     */
    this.convertFromGeoJson = function(oGeoJsonData)
    {
        var oCoordList = [];
        
        if (!oGeoJsonData.hasOwnProperty('type'))
        {
            throw new Error("Argument object with no type property.");
        }
        
        if (!oGeoJsonData.hasOwnProperty('coordinates')
                || !(oGeoJsonData.coordinates instanceof Array))
        {
            throw new Error("Argument object with no or invalid coordinates property.");
        }
        
        switch (oGeoJsonData.type.toLowerCase())
        {
            case 'point':
                if (oGeoJsonData.coordinates.length > 0)
                {
                    oCoordList.push(this.geojsonCoordToLatLonCoordinates(oGeoJsonData.coordinates));
                }
                break;
            case 'linestring':
                for (var iIndex = 0; iIndex < oGeoJsonData.coordinates.length; iIndex++)
                {
                    oCoordList.push(this.geojsonCoordToLatLonCoordinates(oGeoJsonData.coordinates[iIndex]));
                }
                break;
            case 'polygon':
                if ((oGeoJsonData.coordinates.length === 0)
                        || !(oGeoJsonData.coordinates[0] instanceof Array))
                {
                    throw new Error("Argument object with an invalid polygon coordinates property.");
                }
                for (var iIndex = 0; iIndex < oGeoJsonData.coordinates[0].length; iIndex++)
                {
                    oCoordList.push(this.geojsonCoordToLatLonCoordinates(oGeoJsonData.coordinates[0][iIndex]));
                }
                break;
        }
        
        this.coordinates = oCoordList;
    };
};
