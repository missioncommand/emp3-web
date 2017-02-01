import {ControlPanelActions} from '../actions/ControlPanelActions';
import {updateLocalStorage, retrieveLocalStorage} from '../util/LocalStorageUtil';

const LOCAL_STORAGE_KEY = 'validationAppTestGroupState';
const initialState = retrieveLocalStorage(LOCAL_STORAGE_KEY) || {};

export default function testGroupStates(state = initialState, action) {
  let newState = {...state};
  switch (action.type) {
    case ControlPanelActions.TOGGLE_TEST_GROUP:
      if (!newState[action.id]) {
        newState[action.id] = true;
      } else {
        newState[action.id] = !newState[action.id];
      }
      break;
    case ControlPanelActions.OPEN_TEST_GROUP:
      newState[action.id] = true;
      break;
    case ControlPanelActions.CLOSE_TEST_GROUP:
      newState[action.id] = false;
      break;
    default:
      return state;
  }
  updateLocalStorage(LOCAL_STORAGE_KEY, newState);
  return newState;
}
