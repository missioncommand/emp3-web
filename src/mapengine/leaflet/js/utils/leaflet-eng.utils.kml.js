/* global leafLet, L, emp, armyc2, sec */

leafLet.utils = leafLet.utils || {};

leafLet.utils.kml = (function(){
    var privateInterface = {
    };

    var publicInterface = {
        convertCoordinatesToLatLng: function(sKML)
        {
            var oLatLngList = [];
            var oKmlDoc = emp.$(emp.$.parseXML(sKML));
            var sCoordStr;
            var bIsPolygon = false;

            emp.$.each(oKmlDoc.find("coordinates"), function(i, oDescElem)
            {
                if (sCoordStr === undefined)
                {
                    sCoordStr = oDescElem.textContent;
                }
            });

            emp.$.each(oKmlDoc.find("Polygon"), function(i, oDescElem)
            {
                bIsPolygon = true;
            });
            
            if (sCoordStr)
            {
                var aStrCoordList = sCoordStr.split(/\s+/g);
                var aCoord;
                var dLng;
                var dLat;
                var dAlt;
                
                for (var iIndex = 0; iIndex < aStrCoordList.length; iIndex++)
                {
                    if (aStrCoordList[iIndex].length > 0)
                    {
                        aCoord = aStrCoordList[iIndex].split(',');
                        if (aCoord.length > 1)
                        {
                            dLng = Number(aCoord[0]);
                            dLat = Number(aCoord[1]);
                            dAlt = undefined;
                            if (aCoord.length > 2)
                            {
                                dAlt = Number(aCoord[2]);
                            }
                            oLatLngList.push(new L.LatLng(dLat, dLng, dAlt));
                        }
                    }
                }
                
                if (bIsPolygon && (oLatLngList.length > 1))
                {
                    // we need to remove the last one if there is more than one..
                    oLatLngList.splice(oLatLngList.length - 1, 1);
                }
            }
            
            return oLatLngList;
        },
        convertLatLngListToKML: function(sKML, oLatLngList)
        {
            var bIsPolygon = false;
            var oKmlDoc = emp.$.parseXML(sKML);
            var $oKmlDoc = emp.$(oKmlDoc);
            var sCoordStr = "";
            
            emp.$.each($oKmlDoc.find("Polygon"), function(i, oDescElem)
            {
                bIsPolygon = true;
            });

            for (var iIndex = 0; iIndex < oLatLngList.length; iIndex++)
            {
                if (sCoordStr.length > 0)
                {
                    sCoordStr += " ";
                }
                sCoordStr += oLatLngList[iIndex].lng + ",";
                sCoordStr += oLatLngList[iIndex].lat;
                if (!isNaN(oLatLngList[iIndex].alt))
                {
                    sCoordStr += "," + oLatLngList[iIndex].alt;
                }
            }
            
            if (bIsPolygon)
            {
                // For polygon we need to repeat the first one last.
                if (sCoordStr.length > 0)
                {
                    sCoordStr += " ";
                }
                sCoordStr += oLatLngList[0].lng + ",";
                sCoordStr += oLatLngList[0].lat;
                if (!isNaN(oLatLngList[0].alt))
                {
                    sCoordStr += "," + oLatLngList[0].alt;
                }
            }

            var bDone = false;
            emp.$.each($oKmlDoc.find("coordinates"), function(i, oDescElem)
            {
                if (!bDone)
                {
                    oDescElem.textContent = sCoordStr;
                    bDone = true;
                }
            });
            function getXmlAsString(xmlDom){
                return (typeof window.XMLSerializer !== "undefined") ? (new window.XMLSerializer()).serializeToString(xmlDom):
                        xmlDom.xml;
            }

            return getXmlAsString(oKmlDoc); 
        }
    };
    
    return publicInterface;
}());
