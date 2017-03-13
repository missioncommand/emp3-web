describe('cmapi', function() {
  describe('inherit', function() {
    it('copies properties from a superclass to a child class', function() {
      var SuperClass = function() {

        var _superProp = 'superPropString';
        Object.defineProperty(this, 'superProp', {
          enumerable: true,
          get: function() {
            return _superProp;
          },
          set: function(val) {
            _superProp = val;
          }
        });

        this.superFunc = function() {
          return 'This parrot is no more';
        };
      };

      var ChildClass = function() {
        // Invoke the tested class
        cmapi.inherit(new SuperClass(), this);

        this.childFunc = function() {
          return 'He\'s resting, beautiful plumage the Norwegian Blue';
        };
      };

      var parent = new SuperClass();
      var child = new ChildClass();

      child.should.have.property('superProp');
      child.should.have.property('superFunc');
      child.should.have.property('childFunc');

      child.superFunc().should.equal(parent.superFunc());
      child.superProp.should.equal(parent.superProp);

    });
  });

  describe('randomUUID');
  describe('patchProps');
});
