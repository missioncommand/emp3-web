import {ResultActions} from '../actions/ResultActions';
import {updateLocalStorage, retrieveLocalStorage} from '../util/LocalStorageUtil';

const LOCAL_STORAGE_KEY = 'validationAppResults';
const RESULTS_LIMIT = 1000;
let initialState = retrieveLocalStorage(LOCAL_STORAGE_KEY) || [];

/**
 *
 * @param state
 * @param action
 * @returns {*}
 */
const result = (state, action) => {
  if (!action.result) {
    action.result = 'Result was not set';
  }

  switch (action.type) {
    case ResultActions.ADD_RESULT:
      return {
        id: new Date(),
        isError: false,
        result: action.result,
        source: action.source
      };
    case ResultActions.ADD_ERROR:
      return {
        id: new Date(),
        isError: true,
        result: action.result,
        source: action.source
      };
    default:
      return state;
  }
};

/**
 *
 * @param state
 * @param action
 * @returns {*}
 */
export default function results(state = initialState, action) {
  let newState = [...state];
  let warned = false;
  switch (action.type) {
    case ResultActions.ADD_RESULT:
    case ResultActions.ADD_ERROR:
      newState = [
        result(undefined, action),
        ...state
      ];

      while (newState.length >= RESULTS_LIMIT) {
        if (!warned) {
          window.console.warn("You have exceeded the current limit of " + RESULTS_LIMIT + " results, the oldest results are being removed.");
          warned = true;
        }
        newState.pop();
      }
      break;
    case ResultActions.REMOVE_RESULT:
      newState.splice(action.index, 1);
      break;
    case ResultActions.CLEAR_RESULTS:
      newState = [];
      break;
    default:
      return state;
  }
  updateLocalStorage(LOCAL_STORAGE_KEY, newState);
  return newState;
}
