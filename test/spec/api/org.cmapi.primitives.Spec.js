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

  describe('randomUUID', function() {
    it('generates a random UUID value', function() {
      cmapi.randomUUID().should.have.length.at.least(16);
    });
  });

  describe('patchProps', function() {
    it('adds arguments', function() {

      var User = function(args) {
        this.coffee = false;
        this.donuts = false;

        this.patchProps = cmapi.patchProps;
        if (args) {
          this.patchProps(args);
        }
      };

      var coffeeBreak = {
        coffee: true,
        donuts: true
      };

      var unhappyUser = new User();
      unhappyUser.coffee.should.be.false;
      unhappyUser.donuts.should.be.false;

      var happyUser = new User(coffeeBreak);
      happyUser.coffee.should.be.true;
      happyUser.donuts.should.be.true;

    });

    it('ignores empty geoId', function() {
      var ellipse = new emp3.api.Ellipse({geoId: ""});
      ellipse.geoId.should.not.be.empty;
    });
  });
});
