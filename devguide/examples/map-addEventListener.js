
// Creates a map interaction event and then prints out the events to
// the console log.
//
// store the return value from addEventListener, it will be needed when you remove the event as a prameter to the removeEventListener function.
var event = map1.addEventListener({
	eventType: emp3.api.enums.EventType.MAP_INTERACTION,
	callback: function (event) {
		// Check the events type
		switch(event.event) {
			case emp3.api.enums.UserInteractionEventEnum.CLICKED:
				console.log("click - "+event.position.longitude+ ", "+ event.position.longitude);
				break;
			case emp3.api.enums.UserInteractionEventEnum.DOUBLE_CLICKED:
				console.log("double click - "+event.position.longitude+ ", "+ event.position.longitude);
				break;
		}
	}
});
