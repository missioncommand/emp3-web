/* global emp */

/*
 * This file should be moved to emp-map core so it does not have to be
 * recoded or copied to each map engine.
 */

emp.typeLibrary.utils = emp.typeLibrary.utils || {};

emp.typeLibrary.utils.icon = {
    offsetUnit: {
        FRACTION: 'fraction',
        PIXEL: 'pixels',
        INSETPIXELS: 'insetpixels'
    },
    calculateOffset: function(iIconSize, sOffset, sOffsetType)
    {
        var iOffset = 0;
        var iOffsetValue;
        var dFraction;

        switch (sOffsetType.toLowerCase())
        {
            case emp.typeLibrary.utils.icon.offsetUnit.FRACTION:
                dFraction = parseFloat(sOffset);
                iOffset = Math.floor(iIconSize * dFraction);
                break;
            case emp.typeLibrary.utils.icon.offsetUnit.PIXEL:
                iOffsetValue = parseInt(sOffset);
                iOffset = iOffsetValue;
                break;
            case emp.typeLibrary.utils.icon.offsetUnit.INSETPIXELS:
                iOffsetValue = parseInt(sOffset);
                iOffset = iIconSize - iOffsetValue;
                break;
        }

        return iOffset;
    }
};


