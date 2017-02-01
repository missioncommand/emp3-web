import {LookAtActions} from '../actions/LookAtActions';

const initialState = [];

export default function lookAts(state = initialState, action) {
  let newState = [...state];
  switch (action.type) {
    case LookAtActions.ADD_LOOKAT:
      if (action.lookAt && !_.includes(state, action.lookAt)) {
        newState = [...state, action.lookAt];
      }
      break;
    case LookAtActions.REMOVE_LOOKAT:
      if (action.lookAt) {
        newState = [...state];
        _.pull(newState, action.lookAt);
      }
      break;
    case LookAtActions.CLEAR_LOOKATS:
      return [];
    default:
      return state;
  }
  return newState;
}
