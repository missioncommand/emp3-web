/* global leafLet, emp, L */

leafLet.typeLibrary.EmpBoundary = function(oSouthWest, oNorthEast)
{
    this.degNorth = undefined;
    this.degSouth = undefined;
    this.degWest = undefined;
    this.degEast = undefined;

    this.initialize = function(oSW, oNE)
    {
        var oLatLngList;

        if (oSW === undefined)
        {
            throw new Error("Invalid oSouthWest parameters.");
        }
        else if (oNE === undefined)
        {
            if (oSW instanceof L.LatLngBounds)
            {
                if (oSW.getSouthWest() && oSW.getNorthEast())
                {
                    var oSouthWest = oSW.getSouthWest().wrap();
                    var oNorthEast = oSW.getNorthEast().wrap();
                    oLatLngList = [oSouthWest, oNorthEast];
                }
                else
                {
                    oLatLngList = [];
                }
            }
            else if (oSW instanceof Array)
            {
                oLatLngList = oSW;
            }
            else if (oSW instanceof L.LatLng)
            {
                oLatLngList = [oSW];
            }
            else
            {
                throw new Error("Invalid type oSouthWest.");
            }
        }
        else
        {
            oLatLngList = [oSW, oNE];
        }

        for (var iIndex = 0; iIndex < oLatLngList.length; iIndex++)
        {
            addCoordinate.addCoordinate(oLatLngList[iIndex]);
        }
    };

    var addCoordinate = {
        addCoordinate: function(oCoord)
        {
            var oCoordinate = oCoord.wrap();

            if (!this.degNorth)
            {
                this.degNorth = oCoordinate.lat;
                this.degSouth = oCoordinate.lat;
                this.degWest = oCoordinate.lng;
                this.degEast = oCoordinate.lng;
            }
            else
            {
                if (oCoordinate.lat > this.degNorth)
                {
                    this.degNorth = oCoordinate.lat;
                }
                else if (oCoordinate.lat < this.degSouth)
                {
                    this.degSouth = oCoordinate.lat;
                }

                var degSE2Coord = emp.geoLibrary.GetAzimuth({x: this.degEast, y: this.degSouth}, {x: oCoordinate.lng, y: oCoordinate.lat});

                if (degSE2Coord > 0.0)
                {
                    // The Logitude is east of the east edge.
                    this.degEast = oCoordinate.lng;
                }
                else
                {
                    var degSW2Coord = emp.geoLibrary.GetAzimuth({x: this.degWest, y: this.degSouth}, {x: oCoordinate.lng, y: oCoordinate.lat});

                    if (degSW2Coord < 0.0)
                    {
                        // The Logitude is to the west of the west edge.
                        this.degWest = oCoordinate.lng;
                    }
                }
            }
        },
        getNorth: function()
        {
            return this.degNorth;
        },
        getSouth: function()
        {
            return this.degSouth;
        },
        getWest: function()
        {
            return this.degWest;
        },
        getEast: function()
        {
            return this.degEast;
        },
        getCenter: function()
        {
            var oSW = new LatLon(this.degSouth, this.degWest);
            var oNE = new LatLon(this.degNorth, this.degEast);
            var oCenter = oSW.midpointTo(oNE);

            return new L.LatLng(oCenter._lat, oCenter._lon);
        },
        getCenterWest: function()
        {
            var dCenterLat = (this.degNorth + this.degSouth) / 2.0;
            return new L.LatLng(dCenterLat, this.degWest);
        },
        getCenterEast: function()
        {
            var dCenterLat = (this.degNorth + this.degSouth) / 2.0;
            return new L.LatLng(dCenterLat, this.degEast);
        },
        getSouthWest: function()
        {
            return new L.LatLng(this.degSouth, this.degWest);
        },
        getNorthEast: function()
        {
            return new L.LatLng(this.degNorth, this.degEast);
        },
        getSouthEast: function()
        {
            return new L.LatLng(this.degSouth, this.degEast);
        },
        getNorthWest: function()
        {
            return new L.LatLng(this.degNorth, this.degWest);
        },
        containsCoordiante: function(oCoordinate)
        {
            if (!this.degNorth)
            {
                return false;
            }
            else
            {
                if (oCoordinate.lat > this.degNorth)
                {
                    return false;
                }
                else if (oCoordinate.lat < this.degSouth)
                {
                    return false;
                }

                var degSE2Coord = emp.geoLibrary.GetAzimuth({x: this.degEast, y: this.degSouth}, {x: oCoordinate.lng, y: oCoordinate.lat});

                if (degSE2Coord > 0.0)
                {
                    // The Logitude is east of the east edge.
                    return false;
                }
                else
                {
                    var degSW2Coord = emp.geoLibrary.GetAzimuth({x: this.degWest, y: this.degSouth}, {x: oCoordinate.lng, y: oCoordinate.lat});

                    if (degSW2Coord < 0.0)
                    {
                        // The Logitude is to the west of the west edge.
                        return false;
                    }
                }
            }

            return true;
        },
        contained: function(oBoundary)
        {
            if (!this.degNorth || !oBoundary.getNorth())
            {
                return false;
            }
            else
            {
                if (oBoundary.getNorth() > this.degNorth)
                {
                    return false;
                }
                else if (oBoundary.getSouth() < this.degSouth)
                {
                    return false;
                }

                var degSE2Coord = emp.geoLibrary.GetAzimuth({x: this.degEast, y: this.degSouth}, {x: oBoundary.getEast(), y: oBoundary.getNorth()});

                if (degSE2Coord > 0.0)
                {
                    // The Logitude is east of the east edge.
                    return false;
                }
                else
                {
                    var degSW2Coord = emp.geoLibrary.GetAzimuth({x: this.degWest, y: this.degSouth}, {x: oBoundary.getWest(), y: oBoundary.getNorth()});

                    if (degSW2Coord < 0.0)
                    {
                        // The Logitude is to the west of the west edge.
                        return false;
                    }
                }
            }

            return true;
        },
        intersects: function(oBoundary)
        {
            if (!this.degNorth || !oBoundary.getNorth())
            {
                return false;
            }
            else
            {
                if ((oBoundary.getNorth() < this.degSouth) &&
                        (oBoundary.getSouth() > this.degNorth))
                {
                    // The oBoundary is below or above this one.
                    return false;
                }
                else
                {
                    var oSouthWest = this.getSouthWest();
                    var oBNorthEast = oBoundary.getNorthEast();
                    var dBrng = oSouthWest.bearingTo(oBNorthEast);

                    if ((dBrng < 0.0) || (dBrng > 90.0))
                    {
                        return false;
                    }

                    var oSouthEast = this.getSouthEast();
                    var oBNorthWest = oBoundary.getNorthWest();

                    dBrng = oSouthEast.bearingTo(oBNorthWest);

                    if (dBrng < 270.0)
                    {
                        return false;
                    }
                }
            }

            return true;
        },
        isEmpty: function()
        {
            return (!this.degNorth || !this.degSouth || !this.degWest || !this.degEast);
        },
        getCenterWidth: function()
        {
            var oCenterWest = this.getCenterWest();
            var oCenterEast = this.getCenterEast();
            return oCenterWest.distanceTo(oCenterEast);
        },
        setCenterWidth: function(dWidth)
        {
            var oCenter = this.getCenter();
            var oNewWestCoord = oCenter.destinationPoint(270, dWidth / 2.0);
            var oNewEastCoord = oCenter.destinationPoint(90, dWidth / 2.0);

            this.degWest = oNewWestCoord.lng;
            this.degEast = oNewEastCoord.lng;
        }
    };

    this.initialize(oSouthWest, oNorthEast);

    return addCoordinate;
};
