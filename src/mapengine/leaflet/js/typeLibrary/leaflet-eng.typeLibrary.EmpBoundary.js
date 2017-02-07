/* global leafLet, emp, L */

leafLet.typeLibrary.EmpBoundary = function(oSouthWest, oNorthEast) {
    var degNorth = undefined;
    var degSouth = undefined;
    var degWest = undefined;
    var degEast = undefined;

    this.initialize = function(oSW, oNE) {
        var oLatLngList;
        var index;

        if (oSW === undefined) {
            throw new Error("Invalid oSouthWest parameters.");
        } else if (oNE === undefined) {
            if (oSW instanceof L.LatLngBounds) {
                if (oSW.getSouthWest() && oSW.getNorthEast()) {
                    var oSouthWest = oSW.getSouthWest().wrap();
                    var oNorthEast = oSW.getNorthEast().wrap();
                    oSW = oSouthWest.wrap();
                    oNE = oNorthEast.wrap();
                } else {
                    throw new Error("Invalid type oSouthWest.");
                }
            } else if (oSW instanceof Array) {
                if (oSW.length < 2) {
                    throw new Error("Invalid type oSouthWest.");
                }
                
                for (index = 0; index < oSW.length; index++) {
                    publicInterface.addCoordinate(oSW[index]);
                }
                return;
            } else if (oSW instanceof L.LatLng) {
                oNE = oSW;
            } else {
                throw new Error("Invalid type oSouthWest.");
            }
        }

        oNE = oNE.wrap();
        oSW = oSW.wrap();

        degNorth = oNE.lat;
        degEast = oNE.lng;
        degSouth = oSW.lat;
        degWest = oSW.lng;
    };

    var publicInterface = {
        addCoordinate: function(oCoord) {
            var oCoordinate = oCoord.wrap();

            if (!degNorth) {
                degNorth = oCoordinate.lat;
                degSouth = oCoordinate.lat;
                degWest = oCoordinate.lng;
                degEast = oCoordinate.lng;
            } else {
                if (oCoordinate.lat > degNorth) {
                    degNorth = oCoordinate.lat;
                } else if (oCoordinate.lat < degSouth) {
                    degSouth = oCoordinate.lat;
                }

                var degSE2Coord = emp.geoLibrary.GetAzimuth({x: degEast, y: degSouth}, {x: oCoordinate.lng, y: oCoordinate.lat});

                if (degWest <= degEast) {
                    // The bounds does NOT cross the IDL.
                    if (degSE2Coord >= 0.0) {
                        // The Logitude is east of the east edge.
                        degEast = oCoordinate.lng;
                    } else {
                        var degSW2Coord = emp.geoLibrary.GetAzimuth({x: degWest, y: degSouth}, {x: oCoordinate.lng, y: oCoordinate.lat});

                        if (degSW2Coord < 0.0) {
                            // The Logitude is to the west of the west edge.
                            degWest = oCoordinate.lng;
                        }
                    }
                } else {
                    // The bounds does cross the IDL.
                    if (degSE2Coord <= 0.0) {
                        // The Logitude is east of the east edge.
                        degEast = oCoordinate.lng;
                    } else {
                        var degSW2Coord = emp.geoLibrary.GetAzimuth({x: degWest, y: degSouth}, {x: oCoordinate.lng, y: oCoordinate.lat});

                        if (degSW2Coord > 0.0) {
                            // The Logitude is to the west of the west edge.
                            degWest = oCoordinate.lng;
                        }
                    }
                }
            }
        },
        getNorth: function() {
            return degNorth;
        },
        getSouth: function() {
            return degSouth;
        },
        getWest: function() {
            return degWest;
        },
        getEast: function() {
            return degEast;
        },
        getCenter: function() {
            var lat = (degNorth + degSouth) / 2.0;
            var lng = (degEast + degWest) / 2.0;
            
            if (degWest > degEast) {
                if (lng > 0) {
                    lng -= 180.0;
                } else {
                    lng += 180.0;
                }
            }
            return new L.LatLng(lat, lng);
        },
        getCenterWest: function() {
            var dCenterLat = (degNorth + degSouth) / 2.0;
            return new L.LatLng(dCenterLat, degWest);
        },
        getCenterEast: function() {
            var dCenterLat = (degNorth + degSouth) / 2.0;
            return new L.LatLng(dCenterLat, degEast);
        },
        getSouthWest: function() {
            return new L.LatLng(degSouth, degWest);
        },
        getNorthEast: function() {
            return new L.LatLng(degNorth, degEast);
        },
        getSouthEast: function() {
            return new L.LatLng(degSouth, degEast);
        },
        getNorthWest: function() {
            return new L.LatLng(degNorth, degWest);
        },
        containsCoordiante: function(oCoordinate) {
            if (!degNorth) {
                return false;
            } else {
                if (oCoordinate.lat > degNorth) {
                    return false;
                } else if (oCoordinate.lat < degSouth) {
                    return false;
                }

                if (this.containsIDL()) {
                    if ((oCoordinate.lng > degEast) && (oCoordinate.lng < degWest)) {
                        return false;
                    }
                } else {
                    if ((oCoordinate.lng < degWest) || (oCoordinate.lng > degEast)) {
                        return false;
                    }
                }
            }

            return true;
        },
        contained: function(oBoundary) {
            if (!degNorth || !oBoundary.getNorth()) {
                return false;
            } else {
                if (oBoundary.getNorth() > degNorth) {
                    return false;
                } else if (oBoundary.getSouth() < degSouth) {
                    return false;
                }

                var degSE2Coord = emp.geoLibrary.GetAzimuth({x: degEast, y: degSouth}, {x: oBoundary.getEast(), y: oBoundary.getNorth()});

                if (degWest < degEast) {
                    // The IDL is not in the bounds.
                    if (degSE2Coord > 0.0) {
                        // The Logitude is east of the east edge.
                        return false;
                    } else {
                        var degSW2Coord = emp.geoLibrary.GetAzimuth({x: degWest, y: degSouth}, {x: oCoordinate.lng, y: oCoordinate.lat});

                        if (degSW2Coord < 0.0) {
                            // The Logitude is to the west of the west edge.
                            return false;
                        }
                    }
                } else {
                    if (degSE2Coord < 0.0) {
                        // The Logitude is east of the east edge.
                        return false;
                    } else {
                        var degSW2Coord = emp.geoLibrary.GetAzimuth({x: degWest, y: degSouth}, {x: oCoordinate.lng, y: oCoordinate.lat});

                        if (degSW2Coord > 0.0) {
                            // The Logitude is to the west of the west edge.
                            return false;
                        }
                    }
                }
            }

            return true;
        },
        intersects: function(oBoundary) {
            if (!degNorth || !oBoundary.getNorth()) {
                return false;
            } else {
                if ((oBoundary.getNorth() < degSouth) ||
                        (oBoundary.getSouth() > degNorth)) {
                    // The oBoundary is below or above this one.
                    return false;
                } else if (this.containsIDL()) {
                    var bounds = new leafLet.typeLibrary.EmpBoundary(this.getSouthWest(), new L.LatLng(degNorth, 180.0));
                    
                    if (!oBoundary.intersects(bounds)) {
                        bounds = new leafLet.typeLibrary.EmpBoundary(new L.LatLng(degSouth, -180.0), this.getNorthEast());
                        return oBoundary.intersects(bounds);
                    }
                }else if (oBoundary.containsIDL()) {
                    var bounds = new leafLet.typeLibrary.EmpBoundary(oBoundary.getSouthWest(), new L.LatLng(oBoundary.getNorth(), 180.0));
                    
                    if (!this.intersects(bounds)) {
                        bounds = new leafLet.typeLibrary.EmpBoundary(new L.LatLng(oBoundary.getSouth(), -180.0), oBoundary.getNorthEast());
                        return this.intersects(bounds);
                    }
                } else {
                    var oSouthWest = this.getSouthWest();
                    var oBNorthEast = oBoundary.getNorthEast();
                    var dBrng = oSouthWest.bearingTo(oBNorthEast);

                    if ((dBrng < 0.0) || (dBrng > 90.0)) {
                        return false;
                    }

                    var oSouthEast = this.getSouthEast();
                    var oBNorthWest = oBoundary.getNorthWest();

                    dBrng = oSouthEast.bearingTo(oBNorthWest);

                    if (dBrng < 270.0) {
                        return false;
                    }
                }
            }

            return true;
        },
        isEmpty: function() {
            return (!degNorth || !degSouth || !degWest || !degEast);
        },
        getCenterWidth: function() {
            var oCenterWest = this.getCenterWest();
            var oCenterEast = this.getCenterEast();
            return oCenterWest.distanceTo(oCenterEast);
        },
        setCenterWidth: function(dWidth) {
            var oCenter = this.getCenter();
            var oNewWestCoord = oCenter.destinationPoint(-90.0, dWidth / 2.0);
            var oNewEastCoord = oCenter.destinationPoint(90.0, dWidth / 2.0);

            degWest = oNewWestCoord.lng;
            degEast = oNewEastCoord.lng;
        },
        containsIDL: function() {
            return (degWest > degEast);
        }
    };

    this.initialize(oSouthWest, oNorthEast);

    return publicInterface;
};
