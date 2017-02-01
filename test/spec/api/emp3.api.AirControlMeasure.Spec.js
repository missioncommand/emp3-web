describe('emp3.api.AirControlMeasure', function () {
  it('extends emp3.api.Feature', function() {
    var acm = new emp3.api.AirControlMeasure();
    acm.should.be.an.instanceof(emp3.api.Feature);
  });

  describe('constructor', function () {
    it('handles no parameters', function() {
      // make sure the constructor works with no parameters.
      expect(function() {
        new emp3.api.AirControlMeasure();
      }).to.not.throw();
    });

    it('handles valid parameter', function() {
      // make sure the constructor actually creates a feature.
      expect(function() {
        var acm = new emp3.api.AirControlMeasure({
          acmType: cmapi.enums.acmType.CURTAIN
        });

        expect(acm).to.exist;
      }).to.not.throw();
    });

    it('handles invalid parameter', function() {
      // make sure constructor does not throw an error with normal parameters.
      expect(function() {
          new emp3.api.AirControlMeasure({
            acmType: "flarbagarba"
          }).to.not.throw(Error);
      });
    });
  });
/*
  describe('set/getAcmType', function () {

    it('check default value', function() {
      // check to see if default value is correct.
      testACM.acmType().should.equal(cmapi.enums.acmType.CURTAIN);
    });

    it('handles valid inputs', function() {

      testACM.acmType = cmapi.enums.acmType.TRACK;
      // change the value see if it works.
      expect(function() {
        testACM.acmType = cmapi.enums.acmType.TRACK;
      }).to.not.throw();

      // Retrieve the new value.
      testACM.acmType.should.equal(cmapi.enums.acmType.TRACK);
    });

    it('handles invalid inputs', function() {
      // Try to set it to an incorrect value.
      expect(function() {
        testACM.acmType = "Scooby";
      }).to.not.throw();

      // The value should still be the previous value since the last
      expect(testACM.acmType).to.equal(cmapi.enums.acmType.CURTAIN);
    });

  });
*/
/*
  describe('set/getAttributes', function () {

    it('check default value', function() {

      expect(testACM.getAttributes(org.cmapi.primitives.geoAirControlMeasure.Attribute.RADIUS)).to.be.null;

    });

    it('check valid inputs', function() {
      expect(function() {
        testACM.setAttributes(org.cmapi.primitives.geoAirControlMeasure.Attribute.RADIUS, 500);
      }).to.not.throw();
      testACM.getAttributes(org.cmapi.primitives.geoAirControlMeasure.Attribute.RADIUS).should.equal(500);
    });

    it('check invalid inputs', function() {
      expect(function() {
        testACM.setAttributes("flarbagarba", 500);
      }).to.not.throw();

      expect(testACM.getAttributes("flarbagarba")).to.be.null;

    });

  });
*/
  describe('featureType', function() {
    it('is GEO_ACM', function() {
      var acm = new emp3.api.AirControlMeasure();
      acm.featureType.should.equal(emp3.api.enums.FeatureTypeEnum.GEO_ACM);
    });
  });
});
