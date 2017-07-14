var emp = window.emp || {};

/**
 * @namespace
 */
emp.utilities = emp.utilities || {};

/**
 * @class
 */
emp.utilities.Hash = function() {
  var i;
  this.length = 0;
  this.items = [];
  for (i = 0; i < arguments.length; i += 2) {
    if (typeof(arguments[i + 1]) !== 'undefined') {
      this.items[arguments[i]] = arguments[i + 1];
      this.length += 1;
    }
  }
  /**
   *
   * @param in_key
   * @returns {*}
   */
  this.removeItem = function(in_key) {
    var tmp_previous;
    if (typeof(this.items[in_key]) !== 'undefined') {
      this.length -= 1;
      tmp_previous = this.items[in_key];
      delete this.items[in_key];
    }

    return tmp_previous;
  };
  /**
   *
   * @param in_key
   * @returns {Array}
   */
  this.getItem = function(in_key) {
    return this.items[in_key];
  };
  /**
   *
   * @param in_key
   * @param in_value
   * @returns {*}
   */
  this.setItem = function(in_key, in_value) {
    var tmp_previous;
    if (typeof(in_value) !== 'undefined') {
      if (typeof(this.items[in_key]) === 'undefined') {
        this.length += 1;
      } else {
        tmp_previous = this.items[in_key];
      }

      this.items[in_key] = in_value;
    }

    return tmp_previous;
  };
  /**
   *
   * @param in_key
   * @returns {boolean}
   */
  this.hasItem = function(in_key) {
    return typeof(this.items[in_key]) !== 'undefined';
  };
  /**
   *
   */
  this.clear = function() {
    var j;

    for (j in this.items) {
      if (this.items.hasOwnProperty(j)) {
        delete this.items[j];
      }
    }

    this.length = 0;
  };
};

/**
 *
 * @param basePath
 * @returns {{iconUrl: string, offset: {x: number, y: number, xUnits: string, yUnits: string, width: number, height: number}}}
 */
emp.utilities.getDefaultIcon = function(basePath) {
  // This structure allows the engine to properly set the icons hot spot.
  // The x,y are assumed to be the top left corner of the icon.
  // If the default icons is used for Kml, the map engine is responsible
  // for flipping the y according to the y units to account for the
  // KML origin being in the bottom left.
  var icon = "data:image/png;base64,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";


  if (emp.helpers.isEmptyString(basePath)) {
    basePath = "../";
  }

  return {
    iconUrl: icon,
    offset: {
      x: 0.5,
      y: 1.0,
      xUnits: 'fraction',
      yUnits: 'fraction',
      width: 25,
      height: 41
    }
  };

};

/**
 *
 */
emp.utilities.icon = (function() {
  var publicInterface = {
    referencePoint: {
      TOP_LEFT: 'topleft',
      BOTTOM_LEFT: 'bottomleft'
    },
    /**
     * This function returns the default icon
     * with the offset ref to the bottom left.
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
        offset: {
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
    /**
     *
     * @param basePath
     * @returns {{iconUrl, offset}}
     */
    getDefaultIconURL: function(basePath) {

      //return emp.utilities.getDefaultIcon(basePath).iconUrl;
      return emp.utilities.getDefaultIcon(basePath);//.iconUrl;
    },
    /**
     *
     * @param iIconWidth
     * @param nOffset
     * @param sOffsetType
     * @returns {number}
     */
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
    /**
     *
     * @param iIconHeight
     * @param nOffset
     * @param sOffsetType
     * @param cRefPoint
     * @returns {number}
     */
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
      switch (sOffsetType.toLowerCase()) {
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
    /**
     *
     * @param cRefPoint
     * @returns {{xOffset: *, yOffset: *}}
     */
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
