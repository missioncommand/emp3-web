import {EventListenerCallbackActions} from '../actions/EventListenerCallbackActions';

const initialState = {
  lastMessage: ''
};

export default function eventListenerCallbacks(state = initialState, action) {
  let newState = {...state};
  switch (action.type) {
    case EventListenerCallbackActions.ADD_EVENT_LISTENER_CALLBACK:
      if (!newState.hasOwnProperty(action.eventType)) {
        newState[action.eventType] = {callbacks: []};
      }
      newState[action.eventType].callbacks.push(action.callback);
      break;
    case EventListenerCallbackActions.APPEND_EVENT_LISTENER_CALLBACK_MESSAGE:
      if (newState.hasOwnProperty(action.eventType)) {
        if (!newState[action.eventType].hasOwnProperty("message")) {
          newState[action.eventType].message = action.message;
        } else {
          newState[action.eventType].message = newState[action.eventType].message + action.message;
        }
        newState.lastMessage =  action.message + newState.lastMessage;
      }
      break;
    case EventListenerCallbackActions.CLEAR_EVENT_LISTENER_CALLBACK_MESSAGE:

        newState.lastMessage = "";

        break;
    case EventListenerCallbackActions.REMOVE_EVENT_LISTENER_CALLBACK:
      if (newState[action.eventType] && newState[action.eventType].length > 0) {
        _.remove(newState, action.callback);
      } else {
        toastr.warning('No ' + newState[action.eventType] + ' map event listener callbacks present');
      }
      break;
    default:
      return state;
  }
  return newState;
}
