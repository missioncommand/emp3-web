import {MapActions} from '../actions/MapActions';

const initialState = [];

/**
 *
 * @param state
 * @param action
 * @returns {*}
 * @constructor
 */
export default function maps(state = initialState, action) {
  let newState = [...state];
  switch (action.type) {
    case MapActions.ADD_MAP:
      newState.push(action.map);
      break;
    case MapActions.REMOVE_MAP:
      _.remove(newState, {geoId: action.mapId});
      break;
    case MapActions.CLEAR_MAPS:
      newState = [];
      break;
    default:
      return state;
  }
  return newState;
}
