/* global LatLon */

var emp = window.emp || {};
emp.classLibrary = emp.classLibrary || {};

emp.classLibrary.privateClass = function() {
  var publicInterface = {
    initialize: function(oSW, oNE) {
      var oSouthWest;
      var oNorthEast;
      var options;
      var oLatLngList;

      options = {
        degNorth: undefined,
        degSouth: undefined,
        degWest: undefined,
        degEast: undefined
      };
      emp.classLibrary.Util.setOptions(this, options);

      if (oSW === undefined) {
        oLatLngList = [];
      } else if (oNE === undefined) {
        if (oSW instanceof emp.classLibrary.MapExtent) {
          oSouthWest = oSW.getSouthWest();
          oNorthEast = oSW.getNorthEast();

          if (oSouthWest && oNorthEast) {
            oLatLngList = [oSouthWest, oNorthEast];
          }
          else {
            oLatLngList = [];
          }
        } else if (oSW instanceof Array) {
          oLatLngList = oSW;
        } else if (oSW instanceof LatLon) {
          oLatLngList = [oSW];
        } else {
          throw new Error("Invalid type oSouthWest.");
        }
      } else {
        oLatLngList = [oSW, oNE];
      }

      for (var iIndex = 0; iIndex < oLatLngList.length; iIndex++) {
        this.addCoordinate(oLatLngList[iIndex]);
      }
    },
    destroy: function() {
    },
    addCoordinate: function(oCoord) {
      var degSE2Coord;
      var degSW2Coord;
      var oCoordinate = oCoord; //.wrap();

      if (oCoord instanceof emp.classLibrary.Coordinate) {
        oCoordinate = oCoord.getLatLon();
      }

      if (this.options.degNorth === undefined) {
        this.options.degNorth = oCoordinate._lat;
        this.options.degSouth = oCoordinate._lat;
        this.options.degWest = oCoordinate._lon;
        this.options.degEast = oCoordinate._lon;
      }
      else {
        if (oCoordinate._lat > this.options.degNorth) {
          this.options.degNorth = oCoordinate._lat;
        }
        else if (oCoordinate._lat < this.options.degSouth) {
          this.options.degSouth = oCoordinate._lat;
        }

        degSE2Coord = emp.geoLibrary.GetAzimuth({
          x: this.options.degEast,
          y: this.options.degSouth
        }, {x: oCoordinate._lon, y: oCoordinate._lat});

        if (degSE2Coord > 0.0) {
          // The Longitude is east of the east edge.
          this.options.degEast = oCoordinate._lon;
        }
        else {
          degSW2Coord = emp.geoLibrary.GetAzimuth({
            x: this.options.degWest,
            y: this.options.degSouth
          }, {x: oCoordinate._lon, y: oCoordinate._lat});

          if (degSW2Coord < 0.0) {
            // The Longitude is to the west of the west edge.
            this.options.degWest = oCoordinate._lon;
          }
        }
      }
    },
    getNorth: function() {
      return this.options.degNorth;
    },
    getSouth: function() {
      return this.options.degSouth;
    },
    getWest: function() {
      return this.options.degWest;
    },
    getEast: function() {
      return this.options.degEast;
    },
    getCenter: function() {
      var oSW = new LatLon(this.options.degSouth, this.options.degWest);
      var oNE = new LatLon(this.options.degNorth, this.options.degEast);
      var oCenter = oSW.midpointTo(oNE);

      return new LatLon(oCenter._lat, oCenter._lon);
    },
    getCenterNorth: function() {
      var dCenterLon = (this.options.degWest + this.options.degEast) / 2.0;
      return new LatLon(this.options.degNorth, dCenterLon);
    },
    getCenterSouth: function() {
      var dCenterLon = (this.options.degWest + this.options.degEast) / 2.0;
      return new LatLon(this.options.degSouth, dCenterLon);
    },
    getCenterWest: function() {
      var dCenterLat = (this.options.degNorth + this.options.degSouth) / 2.0;
      return new LatLon(dCenterLat, this.options.degWest);
    },
    getCenterEast: function() {
      var dCenterLat = (this.options.degNorth + this.options.degSouth) / 2.0;
      return new LatLon(dCenterLat, this.options.degEast);
    },
    getSouthWest: function() {
      return new LatLon(this.options.degSouth, this.options.degWest);
    },
    getNorthEast: function() {
      return new LatLon(this.options.degNorth, this.options.degEast);
    },
    getSouthEast: function() {
      return new LatLon(this.options.degSouth, this.options.degEast);
    },
    getNorthWest: function() {
      return new LatLon(this.options.degNorth, this.options.degWest);
    },
    containsCoordiante: function(oCoordinate) {
      var degSE2Coord;
      var degSW2Coord;

      if (!this.options.degNorth) {
        return false;
      }
      else {
        if (oCoordinate._lat > this.options.degNorth) {
          return false;
        }
        else if (oCoordinate._lat < this.options.degSouth) {
          return false;
        }

        degSE2Coord = emp.geoLibrary.GetAzimuth({
          x: this.options.degEast,
          y: this.options.degSouth
        }, {x: oCoordinate._lon, y: oCoordinate._lat});

        if (degSE2Coord > 0.0) {
          // The Longitude is east of the east edge.
          return false;
        }
        else {
          degSW2Coord = emp.geoLibrary.GetAzimuth({
            x: this.options.degWest,
            y: this.options.degSouth
          }, {x: oCoordinate._lon, y: oCoordinate._lat});

          if (degSW2Coord < 0.0) {
            // The Longitude is to the west of the west edge.
            return false;
          }
        }
      }

      return true;
    },
    contained: function(oMapExtent) {
      var degSE2Coord;
      var degSW2Coord;

      if (!this.options.degNorth || !oMapExtent.getNorth()) {
        return false;
      }
      else {
        if (oMapExtent.getNorth() > this.options.degNorth) {
          return false;
        }
        else if (oMapExtent.getSouth() < this.degSouth) {
          return false;
        }

        degSE2Coord = emp.geoLibrary.GetAzimuth({
          x: this.options.degEast,
          y: this.options.degSouth
        }, {x: oMapExtent.getEast(), y: oMapExtent.getNorth()});

        if (degSE2Coord > 0.0) {
          // The Longitude is east of the east edge.
          return false;
        }
        else {
          degSW2Coord = emp.geoLibrary.GetAzimuth({
            x: this.options.degWest,
            y: this.options.degSouth
          }, {x: oMapExtent.getWest(), y: oMapExtent.getNorth()});

          if (degSW2Coord < 0.0) {
            // The Longitude is to the west of the west edge.
            return false;
          }
        }
      }

      return true;
    },
    intersects: function(oMapExtent) {
      var oSouthWest;
      var oBNorthEast;
      var dBrng;
      var oSouthEast;
      var oBNorthWest;

      if (!(oMapExtent instanceof emp.classLibrary.MapExtent)) {
        throw new Error("Invalid parameters type.");
      }

      if (!this.options.degNorth || !oMapExtent.getNorth()) {
        return false;
      }
      else {
        if ((oMapExtent.getNorth() < this.options.degSouth) &&
          (oMapExtent.getSouth() > this.options.degNorth)) {
          // The oBoundary is below or above this one.
          return false;
        }
        else {
          oSouthWest = this.getSouthWest();
          oBNorthEast = oMapExtent.getNorthEast();
          dBrng = oSouthWest.bearingTo(oBNorthEast);

          if ((dBrng < 0.0) || (dBrng > 90.0)) {
            return false;
          }

          oSouthEast = this.getSouthEast();
          oBNorthWest = oMapExtent.getNorthWest();

          dBrng = oSouthEast.bearingTo(oBNorthWest);

          if (dBrng < 270.0) {
            return false;
          }
        }
      }

      return true;
    },
    isEmpty: function() {
      return (this.options.degNorth === undefined ||
      this.options.degSouth === undefined ||
      this.options.degWest === undefined ||
      this.options.degEast === undefined);
    },
    getCenterWidth: function() {
      var oCenterWest = this.getCenterWest();
      var oCenterEast = this.getCenterEast();
      return oCenterWest.distanceTo(oCenterEast);
    },
    setCenterWidth: function(dWidth) {
      var oCenter = this.getCenter();
      var oNewWestCoord = oCenter.destinationPoint(270, dWidth / 2.0);
      var oNewEastCoord = oCenter.destinationPoint(90, dWidth / 2.0);

      this.degWest = oNewWestCoord._lon;
      this.degEast = oNewEastCoord._lon;
    },
    reset: function() {
      this.options.degNorth = undefined;
      this.options.degSouth = undefined;
      this.options.degWest = undefined;
      this.options.degEast = undefined;
    }
  };

  return publicInterface;
};

emp.classLibrary.MapExtent = emp.classLibrary.Class.extend(emp.classLibrary.privateClass());
