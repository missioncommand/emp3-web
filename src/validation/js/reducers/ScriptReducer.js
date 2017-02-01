import {ScriptActions} from '../actions/ScriptActions';
import {updateLocalStorage, retrieveLocalStorage} from '../util/LocalStorageUtil';

const LOCAL_STORAGE_KEY = 'validationAppScripts';
const initialState = retrieveLocalStorage(LOCAL_STORAGE_KEY) || [];

export default function scripts(state = initialState, action) {
  let newState = [...state];
  let oldScript;
  switch (action.type) {
    case ScriptActions.SCRIPT_SAVE:
      _.remove(newState, {name: action.name});
      newState.push({
        name: action.name,
        script: action.script
      });
      break;
    case ScriptActions.SCRIPT_SAVE_AS:
      oldScript = _.find(newState, {name: action.oldName});

      // If a new script was passed in
      if (action.script) {
        newState.push({
          name: action.newName,
          script: action.script
        });
      } else {
        // Use the existing script if its a pure re-name action
        newState.push({
          name: action.newName,
          script: oldScript.script
        });
      }
      _.pull(newState, oldScript);
      break;
    case ScriptActions.SCRIPT_DELETE:
      _.remove(newState, {name: action.name});
      break;
    default:
      return state;
  }
  updateLocalStorage(LOCAL_STORAGE_KEY, newState);
  return newState;
}
