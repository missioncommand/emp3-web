import { combineReducers } from 'redux';
import cameras from './CameraReducer';
import eventListeners from './EventListenerCallbackReducer';
import features from './FeatureReducer';
import instructionsStates from './InstructionsStateReducer';
import lookAts from './LookAtReducer';
import maps from './MapReducer';
import mapServices from './MapServiceReducer';
import overlays from './OverlayReducer';
import results from './TestResultReducer';
import scripts from './ScriptReducer';
import testGroupStates from './TestGroupStateReducer';
import testStack from './TestStackReducer';

const rootReducer = combineReducers({
  cameras,
  eventListeners,
  features,
  instructionsStates,
  lookAts,
  maps,
  mapServices,
  overlays,
  results,
  scripts,
  testGroupStates,
  testStack
});

export default rootReducer;
