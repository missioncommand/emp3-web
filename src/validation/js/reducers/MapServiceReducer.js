import {MapServiceActions} from '../actions/MapServiceActions';

const initialState = [];

/**
 *
 * @param state
 * @param action
 * @returns {*}
 * @constructor
 */
export default function activeTest(state = initialState, action) {
  let newState = [...state];
  switch (action.type) {
    case MapServiceActions.ADD_MAPSERVICE:
      newState.push(action.mapService);
      break;
    case MapServiceActions.REMOVE_MAPSERVICES:
      _.pullAll(newState, action.mapServices);
      break;
    case MapServiceActions.CLEAR_MAPSERVICES:
      newState = [];
      break;
    default:
      return state;
  }
  return newState;
}
