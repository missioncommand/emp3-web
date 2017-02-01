
emp = emp || {};
emp.util = emp.util || {};

emp.util.geoJson = (function(){
    var publicInterface = {
        /**
         * @description This function converts the geojson coordinates to a string.
         * @param {object} oGeoJson This parameter must be a geojson object.
         * @returns {String}
         */
        toString: function(oGeoJson) {
            var sStr = "",
                iIndex;
            if (!oGeoJson.hasOwnProperty('type')) {
                throw new Error("GeoJSON object with no type property.");
            }
            
            switch (oGeoJson.type.toLowerCase()) {
                case 'point':
                    sStr = oGeoJson.coordinates[0] + "," + oGeoJson.coordinates[1];
                        
                    if (oGeoJson.coordinates.length === 3) {
                        sStr += "," + oGeoJson.coordinates[2];
                    }
                    break;
                case 'linestring':
                    for (iIndex = 0; iIndex < oGeoJson.coordinates.length; iIndex++) {
                        if (sStr.length > 0) {
                            sStr += " ";
                        }
                        sStr += oGeoJson.coordinates[iIndex][0] + "," + oGeoJson.coordinates[iIndex][1];
                        
                        if (oGeoJson.coordinates[iIndex].length === 3) {
                            sStr += "," + oGeoJson.coordinates[iIndex][2];
                        }
                    }
                    break;
                case 'polygon':
                    // we get the coordinates of the outter polygon.
                    for (iIndex = 0; iIndex < oGeoJson.coordinates[0].length; iIndex++) {
                        if (sStr.length > 0) {
                            sStr += " ";
                        }
                        sStr += oGeoJson.coordinates[0][iIndex][0] + "," + oGeoJson.coordinates[0][iIndex][1];
                        
                        if (oGeoJson.coordinates[0][iIndex].length === 3) {
                            sStr += "," + oGeoJson.coordinates[0][iIndex][2];
                        }
                    }
                    break;
                default:
                    throw new Error("Invalid type for coordinate parsing.");
            }
            
            return sStr;
        },
        /**
         * @description This function converts a single geojson coordinate to an emp.classLibrary.Coordinate object.
         * @param {object} oCoord This parameter must be a single geojson coordinate.
         * @returns {emp.classLibrary.Coordinate}
         */
        toCoordinate: function(oCoord)
        {
            var oCoordinates;
            
            if (oCoord.length === 3) {
                oCoordinates = new emp.classLibrary.Coordinate(oCoord[1], oCoord[0], oCoord[2]);
            } else {
                oCoordinates = new emp.classLibrary.Coordinate(oCoord[1], oCoord[0]);
            }
            
            return oCoordinates;
        },
        /**
         * @description This function convert a geojson coorinates to an array of emp.classLibrary.Coordinate.
         * @param {object} oGeoJson This parameters must be a geojson object.
         * @returns {Array<emp.classLibrary.Coordinate>}
         */
        toCoordinateArray: function(oGeoJson) {
            var oCoordinates = [];
            var oCoord;
            var iIndex;

            if (!oGeoJson.hasOwnProperty('type')) {
                throw new Error("GeoJSON object with no type property.");
            }
            
            switch (oGeoJson.type.toLowerCase()) {
                case 'point':
                    if (oGeoJson.coordinates.length > 0) {
                        oCoordinates.push(publicInterface.toCoordinate(oGeoJson.coordinates));
                    }
                    break;
                case 'linestring':
                    for (iIndex = 0; iIndex < oGeoJson.coordinates.length; iIndex++) {
                        oCoord = publicInterface.toCoordinate(oGeoJson.coordinates[iIndex]);
                        oCoordinates.push(oCoord);
                    }
                    break;
                case 'polygon':
                    // we get the coordinates of the outter polygon.
                    for (iIndex = 0; iIndex < oGeoJson.coordinates[0].length; iIndex++) {
                        oCoord = publicInterface.toCoordinate(oGeoJson.coordinates[0][iIndex]);
                        oCoordinates.push(oCoord);
                    }
                    break;
                case 'feature':
                    switch (oGeoJson.geometry.type.toLowerCase()) {
                        case 'point':
                            if (oGeoJson.geometry.coordinates.length > 0) {
                                oCoordinates.push(publicInterface.toCoordinate(oGeoJson.geometry.coordinates));
                            }
                            break;
                        case 'linestring':
                            for (iIndex = 0; iIndex < oGeoJson.geometry.coordinates.length; iIndex++) {
                                oCoord = publicInterface.toCoordinate(oGeoJson.geometry.coordinates[iIndex]);
                                oCoordinates.push(oCoord);
                            }
                            break;
                        case 'polygon':
                            // we get the coordinates of the outter polygon.
                            for (iIndex = 0; iIndex < oGeoJson.geometry.coordinates[0].length; iIndex++) {
                                oCoord = publicInterface.toCoordinate(oGeoJson.geometry.coordinates[0][iIndex]);
                                oCoordinates.push(oCoord);
                            }
                            break;
                        default:
                            throw new Error("Invalid type for coordinate parsing.");
                    }
                    break;
                default:
                    throw new Error("Invalid type for coordinate parsing.");
            }

            return oCoordinates;
        },
        /**
         * @description This function converts a single emp.classLibrary.Coordinate coordinate to a
         * geojson coordinate object.
         * @param {emp.classLibrary.Coordinate} oEmpCoordinate
         * @returns {object} A geojson coordinate object.
         */
        convertCoordinateToGeoJson: function(oEmpCoordinate) {
            var oGeoJsonCoord = [];
            
            oGeoJsonCoord.push(oEmpCoordinate.getLongitude());
            oGeoJsonCoord.push(oEmpCoordinate.getLatitude());
            
            if (!isNaN(oEmpCoordinate.getAltitude())) {
                oGeoJsonCoord.push(oEmpCoordinate.getAltitude());
            }
            
            return oGeoJsonCoord;
        },
        /**
         * @description This function coverts an array of emp.classLibrary.Coordinate objects into 
         * geojson coordinate object.
         * @param {object} oGeoJson This parameter must be a geojson object.
         * @param {Array<emp.classLibrary.Coordinate>} oEmpCoordinateArray An array of emp.classLibrary.Coordinate objects.
         */
        convertCoordinateArrayToGeoJson: function(oGeoJson, oEmpCoordinateArray) {
            var iIndex;
            
            switch (oGeoJson.type.toLowerCase()) {
                case 'point':
                    oGeoJson.coordinates = publicInterface.convertCoordinateToGeoJson(oEmpCoordinateArray[0]);
                    break;
                case 'linestring':
                    oGeoJson.coordinates = [];

                    for (iIndex = 0; iIndex < oEmpCoordinateArray.length; iIndex++) {
                        oGeoJson.coordinates.push(publicInterface.convertCoordinateToGeoJson(oEmpCoordinateArray[iIndex]));
                    }
                    break;
                case 'polygon':
                    oGeoJson.coordinates = [[]];

                    for (iIndex = 0; iIndex < oEmpCoordinateArray.length; iIndex++) {
                        oGeoJson.coordinates[0].push(publicInterface.convertCoordinateToGeoJson(oEmpCoordinateArray[iIndex]));
                    }
                    break;
                case 'feature':
                    publicInterface.convertCoordinateArrayToGeoJson(oGeoJson.geometry, oEmpCoordinateArray);
                    break;
            }
        }
    };
    
    return publicInterface;
}());
