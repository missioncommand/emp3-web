/*global emp */

emp.utilities = emp.utilities || {};

emp.utilities.getParameterByName = function(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(window.location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

emp.utilities.icon = (function() {
    var publicInterface = {
        referencePoint: {
            TOP_LEFT: 'topleft',
            BOTTOM_LEFT: 'bottomleft'
        },
        /**
         * This function returns the default icon
         * with the offset ref to the bottom left.
         * 
         */
        getDefaultIcon: function(basePath) {
            var oDefaultIcon = emp.utilities.getDefaultIcon(basePath);
            var yOffset = oDefaultIcon.offset.y;
            var yUnits = oDefaultIcon.offset.yUnits;
            
            // Given that the core default icon is defined with the
            // offset ref in the top left we need to convert the y offset
            // to bottom left.

            if (yUnits === 'pixels') {
                yOffset = oDefaultIcon.offset.height - yOffset;
            }
            else if (yUnits === 'fraction') {
                yOffset = 1.0 - yOffset;
            }
            else if (yUnits === 'insetPixels') {
                yOffset = oDefaultIcon.offset.height - yOffset;
            }
            
            return {
                iconUrl: oDefaultIcon.iconUrl,
                offset:{
                    x: oDefaultIcon.offset.x,
                    y: yOffset,
                    xUnits: oDefaultIcon.offset.xUnits,
                    yUnits: oDefaultIcon.offset.yUnits
                },
                size: {
                    width: oDefaultIcon.offset.width,
                    height: oDefaultIcon.offset.height
                }
            };
        },
        getDefaultIconURL: function(basePath) {
            return emp.utilities.getDefaultIcon(basePath).iconUrl;
        },
        calculateXOffset: function(iIconWidth, nOffset, sOffsetType) {
            var iOffset = 0;

            switch (sOffsetType.toLowerCase()) {
                case 'fraction':
                    iOffset = Math.floor(iIconWidth * nOffset * -1.0);
                    break;
                case 'pixels':
                    iOffset = nOffset * -1;
                    break;
                case 'insetpixels':
                    iOffset = (iIconWidth - nOffset) * -1;
                    break;
            }

            return iOffset;
        },
        calculateYOffset: function(iIconHeight, nOffset, sOffsetType, cRefPoint) {
            var iOffset = 0;

            if (cRefPoint === emp.utilities.icon.referencePoint.TOP_LEFT) {
                switch (sOffsetType.toLowerCase()) {
                    case 'fraction':
                        nOffset = (1.0 - nOffset);
                        break;
                    case 'pixels':
                        nOffset = (iIconHeight - nOffset);
                        break;
                    case 'insetpixels':
                        nOffset = (iIconHeight - nOffset);
                        break;
                }
            }
            switch (sOffsetType.toLowerCase())
            {
                case 'fraction':
                    iOffset = Math.floor(iIconHeight * nOffset * -1.0);
                    break;
                case 'pixels':
                    iOffset = nOffset * -1.0;
                    break;
                case 'insetpixels':
                    iOffset = (iIconHeight - nOffset) * -1.0;
                    break;
            }

            return iOffset;
        },
        getDefaultIconOffset: function(cRefPoint) {
            var oDefaultIcon = emp.utilities.icon.getDefaultIcon('../');
            
            return {
                xOffset: emp.utilities.icon.calculateXOffset(oDefaultIcon.size.width, oDefaultIcon.offset.x, oDefaultIcon.offset.xUnits),
                yOffset: emp.utilities.icon.calculateYOffset(oDefaultIcon.size.height, oDefaultIcon.offset.y, oDefaultIcon.offset.yUnits, cRefPoint)
            };
        }
    };
    
    return publicInterface;
})();
