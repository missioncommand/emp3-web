describe('emp.helpers', function () {

  describe('copyObject', function () {
    it('copies arrays', function () {

      var originalArray = [];
      for (var i = 0; i < 1024; i++) {
        originalArray.push(Math.random());
      }
      emp.helpers.copyObject(originalArray).should.deep.equal(originalArray);
    });

    it('copies objects', function () {
      var originalObject = {
        value: 1,
        child1: {
          value1: 2,
          value2: 'b'
        },
        child2: ['value1', 'value2', 'value3'],
        child3: [
          {key: 'key', value: 'value'}
        ]
      };

      emp.helpers.copyObject(originalObject).should.eql(originalObject);
    });

    it('copies strings', function () {
      var originalString = 'emp3';
      emp.helpers.copyObject(originalString).should.equal(originalString);
    });

    it('copies numbers', function () {
      var originalNumber = 3;
      emp.helpers.copyObject(originalNumber).should.equal(originalNumber);

      originalNumber = -3;
      emp.helpers.copyObject(originalNumber).should.equal(originalNumber);
    });
  });

  describe('isCompoundKML', function () {
    var simpleKML = '' +
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<kml xmlns="http://www.opengis.net/kml/2.2">' +
      '   <Placemark>' +
      '     <name>Simple placemark</name>' +
      '     <Point>' +
      '       <coordinates>-122.0,37.4222,0</coordinates>' +
      '     </Point>' +
      '   </Placemark>' +
      '</kml>';

    var compoundKML = '' +
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<kml xmlns="http://www.opengis.net/kml/2.2">' +
      '   <Placemark>' +
      '     <name>Simple placemark</name>' +
      '     <Point>' +
      '       <coordinates>-122.0,37.4222,0</coordinates>' +
      '     </Point>' +
      '   </Placemark>' +
      '   <Placemark>' +
      '     <name>Simple placemark2</name>' +
      '     <Point>' +
      '       <coordinates>-22.0,67.42,0</coordinates>' +
      '     </Point>' +
      '   </Placemark>' +
      '</kml>';

    it('returns false if the KML contains only one coordinates node', function() {
      emp.helpers.isCompoundKML(simpleKML).should.be.false;
    });

    it('returns true if the KML contains multiple coordinates nodes', function() {
      emp.helpers.isCompoundKML(compoundKML).should.be.true;
    });
  });
});
