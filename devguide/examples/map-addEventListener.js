
// Creates a map interaction event and then prints out the events to
// the console log.
//
// store the return value, it will be needed when you remove the event.
var event = map1.addEventListener({
	eventType: emp3.api.enums.EventType.MAP_INTERACTION,
	callback: function (args) {
		switch(args.getEvent()) {
			case emp3.api.enums.UserInteractionEventEnum.CLICKED:
				console.log("click");
				break;
			case emp3.api.enums.UserInteractionEventEnum.DOUBLE_CLICKED:
				console.log("double click");
				break;
		}
	}
});
