describe('emp', function() {
  describe('util', function() {
    describe('milstdColorFix', function() {
      it('updates the objects properties with properties.modifiers for lineColor, lineWidth, and fillColor', function() {
        var modifiers = {
          lineColor: '#FFFFFF',
          lineWidth: 4,
          fillColor: '#3E3E3E'
        };

        var feature = {
          format: emp.typeLibrary.featureFormatType.MILSTD,
          properties: {
            modifiers: modifiers
          }
        };

        emp.util.milstdColorFix(feature);

        feature.properties.should.have.property('lineColor', modifiers.lineColor);
        feature.properties.should.have.property('lineWidth', modifiers.lineWidth);
        feature.properties.should.have.property('fillColor', modifiers.fillColor);
      });
    });
  });
});
