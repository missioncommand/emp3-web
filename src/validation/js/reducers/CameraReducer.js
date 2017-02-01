import {CameraActions} from '../actions/CameraActions';

const initialState = [];

export default function cameras(state = initialState, action) {
  let newState = [...state];
  switch (action.type) {
    case CameraActions.ADD_CAMERA:
      if (action.camera && !_.includes(state, action.camera)) {
        newState = [...state, action.camera];
      }
      break;
    case CameraActions.REMOVE_CAMERA:
      if (action.camera) {
        newState = [...state];
        _.pull(newState, action.camera);
      }
      break;
    case CameraActions.CLEAR_CAMERAS:
      return [];
    default:
      return state;
  }
  return newState;
}
