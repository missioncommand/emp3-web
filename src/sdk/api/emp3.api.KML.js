if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}
/**
 * @class
 * @extends {emp3.api.Feature}
 * @constructor
 * @classdesc This class implements a KML feature. It requires a valid KML string that can be parsed.
 *
 * @param {Object} [args] Parameters are provided as members of the arg object and may contain any properties listed
 * here.
 * @param {String} [args.KMLString] String containing valid KML to be parsed.
 *
 * @example
 * var KMLFeature = new emp3.api.KML({
 *   KMLString: "<kml>
                  <Document>
                    <Placemark id="f2">
                      <name>
                        Feature Collection Test 1
                      </name>
                      <description>
                        <![CDATA[<br/><table border=\"1\" cellpadding=\"2\" cellspacing=\"0\" width=100%><tr ><td><b>lineColor</b></td><td>7f00ffff</td></tr><tr  bgcolor=\"#F0F0F0\"><td><b>lineThickness</b></td><td>5</td></tr></table>]]>
                      </description>
                      <Style id="geomcollection">
                        <LineStyle>
                          <color>7fffff00</color>
                          <width>5</width>
                        </LineStyle>
                        <PolyStyle>
                          <color>88000000</color>
                        </PolyStyle>
                        <LabelStyle>
                          <color>FFFFFFFF</color>
                        </LabelStyle>
                        <IconStyle>
                          <color>00000000</color>
                        </IconStyle>
                      </Style>
                      <MultiGeometry>
                        <LineString>
                          <tessellate>1</tessellate>
                          <coordinates>102,0 103,1 104,0 105,1</coordinates>
                        </LineString>
                        <Point>
                          <coordinates>103.5,0.5</coordinates>
                        </Point>
                      </MultiGeometry>
                    </Placemark>
                  </Document>
                </kml>""
 *   }
 * });
 */
emp3.api.KML = function (args) {
  args = args || {};
  emp3.api.Feature.call(this, args);

  var _KMLString = args.KMLString;
  /**
   * @name emp3.api.KML#KMLString
   * @type {string}
   */
  Object.defineProperty(this, "KMLString", {
    enumerable: true,
    get: function () {
      return _KMLString;
    },
    set: function (value) {
      _KMLString = value;
    }
  });

  /**
   * @const
   * @default emp3.api.enums.FeatureTypeEnum.KML
   * @type {emp3.api.enums.FeatureTypeEnum}
   */
  this.featureType = emp3.api.enums.FeatureTypeEnum.KML;
};

// Extend emp3.api.Feature
emp3.api.KML.prototype = Object.create(emp3.api.Feature.prototype);