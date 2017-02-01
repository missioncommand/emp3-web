import {InstructionsStateActions} from '../actions/InstructionsStateActions';
import {updateLocalStorage, retrieveLocalStorage} from '../util/LocalStorageUtil';

const LOCAL_STORAGE_KEY = 'validationAppInstructionsState';
const initialState = retrieveLocalStorage(LOCAL_STORAGE_KEY) || {};

export default function instructionsStates(state = initialState, action) {
  let newState = {...state};
  switch (action.type) {
    case InstructionsStateActions.TOGGLE_INSTRUCTIONS:
      if (newState[action.testId] === undefined) {
        newState[action.testId] = true;
      } else {
        newState[action.testId] = !newState[action.testId];
      }
      break;
    default:
      return state;
  }
  updateLocalStorage(LOCAL_STORAGE_KEY, newState);
  return newState;
}
