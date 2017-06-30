// This function demonstrates how to destroy a map instance
var _deleteMapInstance = function() {
  map1.purge({
    onSuccess: function() {
      alert("The map instance was successful destroyed");
      location.reload();
    },
    onError: function() {
      alert("The map instance failed to terminate");
    }
  });
};

map1.addEventListener({
  eventType: emp3.api.enums.EventType.MAP_INTERACTION,
  callback: function(e) {
    if (e.event === emp3.api.enums.UserInteractionEventEnum.CLICKED ||
      e.event === emp3.api.enums.UserInteractionEventEnum.DOUBLE_CLICKED) {
      _deleteMapInstance();
    }
  }
});

alert('Click the map to shut it down');
