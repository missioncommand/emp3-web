import {OverlayActions} from '../actions/OverlayActions';

const initialState = [];

export default function overlays(state = initialState, action) {
  let newState = [...state];
  switch (action.type) {
    case OverlayActions.ADD_OVERLAY:
      newState = [...state, action.overlay];
      break;
    case OverlayActions.ADD_OVERLAYS:
        newState = _.concat(state, action.overlay);
        break;
    case OverlayActions.REMOVE_OVERLAY:
      _.pull(newState, action.overlay);
      break;
    case OverlayActions.REMOVE_OVERLAYS:
      _.pull(newState, action.overlays);
      break;
    case OverlayActions.CLEAR_FEATURES:
      return [];
    default:
      return state;
  }
  return newState;
}
