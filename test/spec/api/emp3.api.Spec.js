describe('emp3.api', function () {
  describe('createGUID', function () {
    it('returns a UUID string', function () {
      emp3.api.createGUID().should.match(/[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}/i);
    });
  });

  describe('emp3.api.Hash', function () {
    var hash, guid, object;
    beforeEach(function () {
      guid = emp3.api.createGUID();
      object = {foo: 'bar'};
      hash = new emp3.api.Hash();

      // add some additional objects
      for (var i = 0; i < 100; i++) {
        hash.setItem(emp3.api.createGUID(), {key: emp3.api.createGUID()});
      }
    });

    describe('removeItem', function () {
      it('removes an item from the hash with the specified entry', function () {
        hash.setItem(guid, object);
        hash.hasItem(guid).should.be.true;
        hash.removeItem(guid);
        hash.hasItem(guid).should.be.false;
      });
    });

    describe('getItem', function () {
      it('retrieves the item from the hash', function () {
        hash.setItem(guid, object);
        hash.getItem(guid).should.equal(object);
      });
    });

    describe('setItem', function () {
      it('inserts objects into the hash', function () {
        hash.hasItem(guid).should.be.false;
        hash.setItem(guid, object);
        hash.hasItem(guid).should.be.true;
      });
    });

    describe('hasItem', function () {
      it('returns true if the item exists in the hash', function () {
        hash.hasItem(guid).should.be.false;
        hash.setItem(guid, object);
        hash.hasItem(guid).should.be.true;
      });
      it('returns false if no such item exists in the hash', function () {
        hash.hasItem('one million dollars').should.be.false;
      });
    });

    describe('clear', function () {
      it('clears the hash of items', function () {
        hash.toArray().should.have.length(100);
        hash.clear();
        hash.toArray().should.have.length(0);
      });
    });

    describe('toArray', function () {
      it('converts the hash to an array', function () {
        hash.toArray().should.be.an.instanceof(Array);
      });
    });
  });

  describe('convertToKilometers', function () {
    it('handles km', function () {
      var dist = 1, unit = 'km';
      emp3.api.convertToKilometers(dist, unit).should.equal(dist);
    });
    it('handles mi', function () {
      var dist = 1, unit = 'mi';
      emp3.api.convertToKilometers(dist, unit).should.be.closeTo(1.60934, 0.00001);
    });
    it('handles nmi', function () {
      var dist = 1, unit = 'nmi';
      emp3.api.convertToKilometers(dist, unit).should.be.closeTo(1.852, 0.0001);
    });
    it('handles yd', function () {
      var dist = 1, unit = 'yd';
      emp3.api.convertToKilometers(dist, unit).should.be.closeTo(0.0009144, 0.0000001);
    });
    it('handles ft', function () {
      var dist = 1, unit = 'ft';
      emp3.api.convertToKilometers(dist, unit).should.be.closeTo(0.0003048, 0.000001);
    });
    it('handles m', function () {
      var dist = 1, unit = 'm';
      emp3.api.convertToKilometers(dist, unit).should.equal(0.001);
    });
    it('throws an error if an unsupported unit is used', function () {
      var dist = 1, unit = 'furlong';
      var convert = function () {
        emp3.api.convertToKilometers(dist, unit);
      };
      convert.should.throw();
    });
  });

  describe('convertGeoJsonToCoordinateString', function () {

  });

  describe('convertCoordinateStringToGeoJson', function () {

  });

  describe('convertLocationArrayToString', function () {

  });

  describe('getProperties', function () {
    var v2Feature;

    beforeEach(function () {
      v2Feature = {
        featureType: emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL,
        readOnly: false,
        azimuth: 0,
        buffer: '',
        timeStamp: new Date(),
        extrude: false,
        tessellate: false,
        altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND,
        labelStyle: {
          labelScale: 1
        },
        fillStyle: {
          fillColor: '99FF00FF',
          fillPattern: 'solid'
        },
        strokeStyle: {
          strokeWidth: 2,
          strokeColor: 'FF000000',
          strokePattern: ''
        }
      };
    });


    it('converts feature properties to a V3 properties object', function () {
      var properties = emp3.api.getProperties(v2Feature);

      properties.should.have.property('featureType', v2Feature.featureType);
      properties.should.have.property('readOnly', v2Feature.readOnly);
      //properties.should.have.property('labelColor', v2Feature.labelStyle.labelColor);
      properties.should.have.property('labelScale', v2Feature.labelStyle.labelScale);
      properties.should.have.property('azimuth', v2Feature.azimuth);
      properties.should.have.property('buffer', v2Feature.buffer);
      properties.should.have.property('timeStamp', v2Feature.timeStamp);
      properties.should.have.property('extrude', v2Feature.extrude);
      properties.should.have.property('tessellate', v2Feature.tessellate);
      properties.should.have.property('altitudeMode', emp3.api.convertAltitudeMode(v2Feature.altitudeMode));
      properties.should.have.property('lineWidth', v2Feature.strokeStyle.strokeWidth);
      properties.should.have.property('fillColor', v2Feature.fillStyle.fillColor);
      properties.should.have.property('fillPattern', v2Feature.fillStyle.fillPattern);
      properties.should.have.property('lineColor', v2Feature.strokeStyle.strokeColor);
      properties.should.have.property('strokeDashstyle', v2Feature.strokeStyle.strokePattern);
    });

    describe('GEO_ACM', function () {
      it('returns attributes and labelStyle', function () {
        v2Feature.featureType = emp3.api.enums.FeatureTypeEnum.GEO_ACM;
        v2Feature.labelStyle = {
          strokeColor: '255,255,255,0.5'
        };

        var properties = emp3.api.getProperties(v2Feature);
        properties.should.have.property('labelStyle', v2Feature.labelStyle);
      });
    });

    describe('GEO_CIRCLE', function () {
      it('handles radius', function () {
        v2Feature.featureType = emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE;
        v2Feature.radius = 50000;
        var properties = emp3.api.getProperties(v2Feature);
        properties.should.have.property('radius', v2Feature.radius);
      });
    });

    describe('GEO_ELLIPSE', function () {
      it('handles semiMajor,semiMinor', function () {
        v2Feature.featureType = emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE;
        v2Feature.semiMajor = 5000;
        v2Feature.semiMinor = 1000;
        var properties = emp3.api.getProperties(v2Feature);
        properties.should.have.property('semiMajor', v2Feature.semiMajor);
        properties.should.have.property('semiMinor', v2Feature.semiMinor);
      });
    });

    describe('GEO_MIL_SYMBOL:', function () {
      it('handles modifiers, symbolStandard', function () {
        v2Feature.featureType = emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL;
        v2Feature.symbolStandard = '2525c';
        v2Feature.modifiers = {
          affiliation: 'F'
        };
        var properties = emp3.api.getProperties(v2Feature);
        properties.modifiers.should.exist;
        properties.modifiers.should.have.property('standard', v2Feature.symbolStandard);
        properties.modifiers.should.have.property('affiliation', v2Feature.modifiers.affiliation);
      });
    });

    describe('GEO_POINT', function () {
      it('handles iconUrl, iconYOffset, iconXOffset, iconSize, labelStyle', function () {
        v2Feature.featureType = emp3.api.enums.FeatureTypeEnum.GEO_POINT;
        v2Feature.iconURI = 'https://some.server/resources/icons/foo.png';
        v2Feature.offsetY = 5;
        v2Feature.offsetX = 0;
        v2Feature.iconSize = 32;
        v2Feature.labelStyle = {
          strokeColor: '255,255,255,0.5'
        };

        var properties = emp3.api.getProperties(v2Feature);
        properties.should.have.property('iconUrl', v2Feature.iconURI);
        properties.should.have.property('iconYOffset', v2Feature.offsetY);
        properties.should.have.property('iconXOffset', v2Feature.offsetX);
        properties.should.have.property('iconSize', v2Feature.iconSize);
        properties.should.have.property('labelStyle', v2Feature.labelStyle);
      });
    });

    describe('GEO_RECTANGLE', function () {
      it('handles width, height', function () {
        v2Feature.featureType = emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE;
        v2Feature.width = 999999;
        v2Feature.height = 12234;

        var properties = emp3.api.getProperties(v2Feature);
        properties.should.have.property('width', v2Feature.width);
        properties.should.have.property('height', v2Feature.height);
      });
    });

    describe('GEO_SQUARE', function () {
      it('handles width', function () {
        v2Feature.featureType = emp3.api.enums.FeatureTypeEnum.GEO_SQUARE;
        v2Feature.width = 54321;

        var properties = emp3.api.getProperties(v2Feature);
        properties.should.have.property('width', v2Feature.width);
      });
    });

    describe('GEO_TEXT', function () {
      it('handles labelStyle', function () {
        v2Feature.featureType = emp3.api.enums.FeatureTypeEnum.GEO_TEXT;
        v2Feature.labelStyle = {
          strokeColor: '0,0,255,1'
        };

        var properties = emp3.api.getProperties(v2Feature);
        properties.should.have.property('labelStyle', v2Feature.labelStyle);
      });
    });
  });

  describe('convertLocationArrayToCMAPI', function () {
    it('converts a GeoPositionGroup to a CMAPI style group', function () {

      var original = [
        {lat: 0, lon: 5, alt: 2},
        {lat: 1, lon: 1, alt: 2},
        {lat: 0, lon: 5, alt: 3},
        {lat: 1, lon: 1, alt: 3}
      ];

      var converted = emp3.api.convertLocationArrayToCMAPI(original);
      converted.should.have.length(original.length);
      for (var i = 0; i < converted.length; i++) {
        converted[i].latitude.should.eql(original[i].lat);
        converted[i].longitude.should.eql(original[i].lon);
        converted[i].altitude.should.eql(original[i].alt);
      }
    });
  });

  describe('convertCMAPIPositionsToGeoJson', function () {
    describe('Point', function () {
      it('creates an array with 3 values in the format [lon, lat, alt]', function () {
        var positions = [{latitude: 0, longitude: 99, altitude: 50001}];
        emp3.api.convertCMAPIPositionsToGeoJson(positions, 'Point').should.eql([
          positions[0].longitude, positions[0].latitude, positions[0].altitude
        ]);
      });
    });

    describe('LineString', function () {
      it('creates an array of arrays of points', function () {
        var positions = [
          {latitude: 0, longitude: 91, altitude: 50001},
          {latitude: 0, longitude: 92, altitude: 50002},
          {latitude: 0, longitude: 93, altitude: 50003},
          {latitude: 0, longitude: 94, altitude: 50004}
        ];

        var converted = emp3.api.convertCMAPIPositionsToGeoJson(positions, 'LineString');
        converted.should.have.length(positions.length);
        converted[0].should.eql([91, 0, 50001]);
        converted[1].should.eql([92, 0, 50002]);
        converted[2].should.eql([93, 0, 50003]);
        converted[3].should.eql([94, 0, 50004]);
      });
    });

    describe('Polygon', function () {
      it('creates an array of array of arrays', function () {
        var positions = [
          {latitude: 0, longitude: 91, altitude: 50001},
          {latitude: 0, longitude: 92, altitude: 50002},
          {latitude: 0, longitude: 93, altitude: 50003},
          {latitude: 0, longitude: 94, altitude: 50004}
        ];

        var converted = emp3.api.convertCMAPIPositionsToGeoJson(positions, 'Polygon');
        converted[0].should.have.length(positions.length);
        converted[0][0].should.eql([91, 0, 50001]);
        converted[0][1].should.eql([92, 0, 50002]);
        converted[0][2].should.eql([93, 0, 50003]);
        converted[0][3].should.eql([94, 0, 50004]);
      });
    });
  });

  describe('convertFeatureToGeoJSON', function () {

  });
});
