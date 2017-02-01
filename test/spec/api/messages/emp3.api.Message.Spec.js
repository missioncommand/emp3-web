describe('emp3.api.Message', function() {
  describe('serialize', function() {
    it('returns a serialized version of the current payload', function() {
      var message = new emp3.api.Message();
      message.payload = {foo:'bar'};
      message.serialize().should.equal(JSON.stringify(message.payload));
    });
  });
});
