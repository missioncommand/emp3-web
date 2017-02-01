if (!window.emp3) {
    emp3 = {};
}
if (!window.emp3.api) {
    emp3.api = {};
}

/**
 * @class
 * @extends {emp3.api.MapService}
 * @constructor
 * @classdesc This class defines the interface to a KML Layer. It requires a
 * url that points to a KML data source, a KMZ data source or a blob of KML data.
 * The data that shows on the map from a KMLLayer cannot be selected, edited, or modified. This KML
 * data will not raise emp3.api.events.FeatureUserInteractionEvent events.
 * It becomes a map background.  To create selectable, editable KML data, use the emp3.api.KML
 * Feature class.
 * <p>
 * The KMLLayer will check the url property first to see if it has been defined.
 * If it hasn't been defined, then it will check the kmlString property.
 *
 * @param {Object} args Arguments members are provided as part of the args object
 *
 * @example <caption>Creating 2 KML Layers and adding them to a map</caption>
 * var kmlLayer1 = new emp3.api.KMLLayer({
 *   name: 'Pentagon',
 *   description: 'KML displaying Pentagon.',
 *   kmlString: "<kml>
 *                 <Document>
 *                    <Placemark id="f2">
 *                      <name>
 *                        Feature Collection Test 1
 *                      </name>
 *                      <description>
 *                        <![CDATA[<br/><table border=\"1\" cellpadding=\"2\" cellspacing=\"0\" width=100%><tr ><td><b>lineColor</b></td><td>7f00ffff</td></tr><tr  bgcolor=\"#F0F0F0\"><td><b>lineThickness</b></td><td>5</td></tr></table>]]>
 *                      </description>
 *                      <Style id="geomcollection">
 *                        <LineStyle>
 *                          <color>7fffff00</color>
 *                          <width>5</width>
 *                        </LineStyle>
 *                        <PolyStyle>
 *                          <color>88000000</color>
 *                        </PolyStyle>
 *                        <LabelStyle>
 *                          <color>FFFFFFFF</color>
 *                        </LabelStyle>
 *                        <IconStyle>
 *                          <color>00000000</color>
 *                        </IconStyle>
 *                      </Style>
 *                      <MultiGeometry>
 *                        <LineString>
 *                          <tessellate>1</tessellate>
 *                          <coordinates>102,0 103,1 104,0 105,1</coordinates>
 *                        </LineString>
 *                        <Point>
 *                          <coordinates>103.5,0.5</coordinates>
 *                        </Point>
 *                      </MultiGeometry>
 *                    </Placemark>
 *                </Document>
 *             </kml>""
 *   }
 * });
 *
 * var kmlLayer2 = new emp3.api.KMLLayer({
 *   url: 'https://developers.google.com/maps/documentation/javascript/examples/kml/westcampus.kml',
 *   name: 'Google west campus',
 *   description: 'KML displaying Google's west campus.',
 *   useProxy: false
 *  });
 *
 *  map.addMapService({
 *    mapService: kmlLayer1,
 *    onSuccess: function() {
 *      // callbacks or notification of complete
 *    }
 *  });
 *
 *  map.addMapService({
 *    mapService: kmlLayer2,
 *    onSuccess: function() {
 *      // callbacks or notification of complete
 *    }
 *  });
 */
emp3.api.KMLLayer = function (args) {
  // Initialize the args object to the default.
  args = args || {};
  
  emp3.api.MapService.call(this, args);

  // Should URL supersede data blob?
  var _kmlString = args.url === undefined ? args.kmlString : undefined;
  /**
   * @name emp3.api.KMLLayer#kmlString
   * @type {string}
   */
  Object.defineProperty(this, "kmlString", {
    enumerable: true,
    get: function () {
      return _kmlString;
    },
    set: function (value) {
      _kmlString = value;
    }
  });

  /**
   * @name emp3.api.KMLLayer#format
   * @const
   * @default kmlLayer
   * @type {string}
   */
  Object.defineProperty(this, 'format', {
    enumerable: true,
    writable: false,
    value: 'kmlLayer'
  });
};

// Extend emp3.api.MapService
emp3.api.KMLLayer.prototype = Object.create(emp3.api.MapService.prototype);
