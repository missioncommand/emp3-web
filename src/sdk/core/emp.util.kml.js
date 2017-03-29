var emp = emp || {};
emp.util = emp.util || {};

/**
 *
 */
emp.util.kml = (function() {
  var publicInterface = {
    toCoordinateArray: function(sKML) {
      var oaCoordList = [];
      var oKmlDoc = emp.util.parseXML(sKML);
      var bIsPolygon = false;
      var aCoord;
      var dLng;
      var dLat;
      var dAlt;
      var iIndex;

      var processCoordString = function(sCoordStr) {
        var aStrCoordList;

        if (!emp.util.isEmptyString(sCoordStr)) {
          aStrCoordList = sCoordStr.split(/\s+/g);

          for (iIndex = 0; iIndex < aStrCoordList.length; iIndex++) {
            if (aStrCoordList[iIndex].length > 0) {
              aCoord = aStrCoordList[iIndex].split(',');
              if (aCoord.length > 1) {
                dLng = Number(aCoord[0]);
                dLat = Number(aCoord[1]);
                dAlt = undefined;
                if (aCoord.length > 2) {
                  dAlt = Number(aCoord[2]);
                }
                oaCoordList.push(new emp.classLibrary.Coordinate(dLat, dLng, dAlt));
              }
            }
          }

          if (bIsPolygon && (oaCoordList.length > 1)) {
            // we need to remove the last one if there is more than one.
            oaCoordList.splice(oaCoordList.length - 1, 1);
          }
        }
      };

      emp.util.each(oKmlDoc.getElementsByTagName("Polygon"), function() {
        bIsPolygon = true;
      });

      emp.util.each(oKmlDoc.getElementsByTagName("coordinates"), function(oDescElem) {
        processCoordString(oDescElem.childNodes[0].nodeValue);
      });

      return oaCoordList;
    },
    toKMLfromCoordinateArray: function(sKML, oaCoordArray) {
      var bIsPolygon = false;
      var oKmlDoc = emp.util.parseXML(sKML);
      var sCoordStr = "";

      emp.util.each(oKmlDoc.getElementsByTagName("Polygon"), function() {
        bIsPolygon = true;
      });

      for (var iIndex = 0; iIndex < oaCoordArray.length; iIndex++) {
        if (sCoordStr.length > 0) {
          sCoordStr += " ";
        }
        sCoordStr += oaCoordArray[iIndex].getLongitude() + ",";
        sCoordStr += oaCoordArray[iIndex].getLatitude();
        if (!isNaN(oaCoordArray[iIndex].getAltitude())) {
          sCoordStr += "," + oaCoordArray[iIndex].getAltitude();
        }
      }

      if (bIsPolygon) {
        // For polygon we need to repeat the first one last.
        if (sCoordStr.length > 0) {
          sCoordStr += " ";
        }
        sCoordStr += oaCoordArray[0].getLongitude() + ",";
        sCoordStr += oaCoordArray[0].getLatitude();
        if (!isNaN(oaCoordArray[0].getAltitude())) {
          sCoordStr += "," + oaCoordArray[0].getAltitude();
        }
      }

      var bDone = false;
      emp.util.each(oKmlDoc.getElementsByTagName("coordinates"), function(oDescElem) {
        if (!bDone) {
          oDescElem.childNodes[0].nodeValue = sCoordStr;
          bDone = true;
        }
      });
      function getXmlAsString(xmlDom) {
        return (typeof window.XMLSerializer !== "undefined") ? (new window.XMLSerializer()).serializeToString(xmlDom) :
          xmlDom.xml;
      }

      return getXmlAsString(oKmlDoc);
    }
  };

  return publicInterface;
}());
