describe('emp.typeLibrary.Feature', function () {
  describe('generateData', function () {
    it('generates new KML strings from a KML feature', function() {
      var args = {
        intentParams: ''
      };

      var feature = new emp.typeLibrary.Feature(args);
      var updates = {
        coordinates: [
          {lon: 1, lat: 1}
        ]
      };

      feature.format = emp.typeLibrary.featureFormatType.KML;
      feature.data = '' +
        '<Placemark>' +
        ' <name>placemark</name>' +
        ' <Point>' +
        '   <coordinates>0,0</coordinates>' +
        ' </Point>' +
        '</Placemark>';

      var newData = feature.generateData({feature: feature, updates: updates});
      newData.should.contain("<coordinates>1,1</coordinates>");
      newData.should.contain("<name>placemark</name>");
    });
  });
});
