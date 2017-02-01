import keymirror from 'keymirror';

export const EventListenerCallbackActions = keymirror({
  ADD_EVENT_LISTENER_CALLBACK: 'add',
  APPEND_EVENT_LISTENER_CALLBACK_MESSAGE: 'append',
  CLEAR_EVENT_LISTENER_CALLBACK_MESSAGE: 'clear',
  REMOVE_EVENT_LISTENER_CALLBACK: null
});

export const addEventListenerCallback = (eventType, callback) => {
  return ({
    type: EventListenerCallbackActions.ADD_EVENT_LISTENER_CALLBACK,
    eventType: eventType,
    callback: callback
  });
};

export const appendEventListenerCallbackMessage = (eventType, message) => {
  return ({
    type: EventListenerCallbackActions.APPEND_EVENT_LISTENER_CALLBACK_MESSAGE,
    eventType: eventType,
    message: message
  });
};

export const clearEventListenerCallbackMessage = () => {
  return ({
    type: EventListenerCallbackActions.CLEAR_EVENT_LISTENER_CALLBACK_MESSAGE
  });
};


export const removeEventListenerCallback = (eventType, callback) => {
  return ({
    type: EventListenerCallbackActions.REMOVE_EVENT_LISTENER_CALLBACK,
    eventType: eventType,
    callback: callback
  });
};
