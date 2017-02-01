describe('emp.util', function () {
  describe('isEmptyString', function () {
    it('returns true for undefined and null', function () {
      expect(emp.util.isEmptyString(null)).to.be.true;
      expect(emp.util.isEmptyString(undefined)).to.be.true;
    });

    it('returns true given ""', function () {
      expect(emp.util.isEmptyString("")).to.be.true;
    });

    it('returns true given objects and arrays', function () {
      expect(emp.util.isEmptyString(['taco', 'burrito', 'taquito'])).to.be.true;
      expect(emp.util.isEmptyString({'key': 'value'})).to.be.true;
    });

    it('returns true given numbers', function () {
      expect(emp.util.isEmptyString(42)).to.be.true;
    });

    it('returns false given strings', function () {
      expect(emp.util.isEmptyString("w")).to.be.false;
      expect(emp.util.isEmptyString("wer 90sg")).to.be.false;
    });
  });

  describe('getBooleanValue', function () {
    it('throws an error if a non boolean is set as the default', function () {
      var getBooleanValue = function () {
        emp.util.getBooleanValue(true, 'true');
      };
      getBooleanValue.should.throw(/Invalid boolean default value/);
    });

    it('returns a default value if a non boolean or representative string is passed in', function () {
      emp.util.getBooleanValue('test', true).should.be.true;
      emp.util.getBooleanValue('test', false).should.be.false;
      emp.util.getBooleanValue(0, true).should.be.true;
      emp.util.getBooleanValue(undefined, false).should.be.false;
      emp.util.getBooleanValue(null, false).should.be.false;
      emp.util.getBooleanValue({key: 'value'}, true).should.be.true;
    });

    it('returns the correct boolean instead of a default when a proper boolean is passed', function () {
      emp.util.getBooleanValue(false, true).should.be.false;
      emp.util.getBooleanValue(true, false).should.be.true;
    });

    it('returns the correct boolean instead of a default given a string of `true` or `false`', function () {
      emp.util.getBooleanValue('true', false).should.be.true;
      emp.util.getBooleanValue('tRUe', false).should.be.true;
      emp.util.getBooleanValue('TRUE', false).should.be.true;

      emp.util.getBooleanValue('false', true).should.be.false;
      emp.util.getBooleanValue('FaLse', true).should.be.false;
      emp.util.getBooleanValue('FALSE', true).should.be.false;
    });
  });

  describe('isAirspaceSymbol', function () {
    it('returns true for valid airspace symbols, false otherwise', function () {
      var validSymbols = [
        emp.constant.airspaceSymbolCode.SHAPE3D_CAKE,
        emp.constant.airspaceSymbolCode.SHAPE3D_ROUTE,
        emp.constant.airspaceSymbolCode.SHAPE3D_CYLINDER,
        emp.constant.airspaceSymbolCode.SHAPE3D_ORBIT,
        emp.constant.airspaceSymbolCode.SHAPE3D_POLYGON,
        emp.constant.airspaceSymbolCode.SHAPE3D_RADARC,
        emp.constant.airspaceSymbolCode.SHAPE3D_POLYARC,
        emp.constant.airspaceSymbolCode.SHAPE3D_TRACK,
        emp.constant.airspaceSymbolCode.SHAPE3D_CURTAIN
      ];

      for (var i = 0; i < validSymbols.length; i++) {
        emp.util.isAirspaceSymbol(validSymbols[i]).should.be.true;
      }

      emp.util.isAirspaceSymbol('SFGPUCI----K---').should.be.false;
    });
  });

  describe('validateEnvironment', function () {
    it('returns the enumerated version of the environment string', function () {
      emp.util.validateEnvironment('starfish').should.equal(emp.environment.starfish);
      emp.util.validateEnvironment('owf').should.equal(emp.environment.owf);
      emp.util.validateEnvironment('iwc').should.equal(emp.environment.iwc);
    });

    it('defaults to browser', function () {
      emp.util.validateEnvironment('browser').should.equal(emp.environment.browser);
      emp.util.validateEnvironment().should.equal(emp.environment.browser);
      emp.util.validateEnvironment('and now for something completely different').should.equal(emp.environment.browser);
    });
  });

  describe('parseXML', function () {
    it('parses well formed XML and returns an XMLDocument', function () {
      var simpleXML = '' +
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Placemark id="place1">' +
        '  <name>a place named one</name>' +
        '  <coordinates>' +
        '    <latitude>23</latitude>' +
        '    <longitude>-19.3234</longitude>' +
        '  </coordinates>' +
        '</Placemark>';

      var xmlDoc = emp.util.parseXML(simpleXML);
      should.exist(xmlDoc);

      var latNode = xmlDoc.getElementsByTagName('latitude')[0];
      should.exist(latNode);
      latNode.childNodes[0].nodeValue.should.equal('23');
    });
  });

  describe('each', function() {
    it ('iterates over arrays', function() {
      var lowerCase = ["obi-wan", "kenobi"];
      var upperCase = [];
      var capitalize = function (str) {
        upperCase.push(str.toUpperCase());
      };

      emp.util.each(lowerCase, capitalize);
      upperCase.should.include.members(["OBI-WAN", "KENOBI"]);
    });

    it ('iterates over HTMLCollections');
    it ('iterates over NodeLists');
    it ('iterates over NameNodeMaps');
  });
});
