map1.setExtent({
  north: 45.23,
  south: 15.8,
  east: 51,
  west: 15,
  range: 800000,
  animate: true,
  onSuccess: function(args) {
    window.console.debug(args, 'map.setExtent');
    setTimeout(function() {
      window.console.info(map1.extent);
    }.bind(this), 1000); // The map object extent is handled by a second callback
  },
  onError: function(err) {
    window.console.error(err);
  }
});
