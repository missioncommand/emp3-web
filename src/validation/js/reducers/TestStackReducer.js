import assign from 'object-assign';
import {TestActions} from '../actions/TestActions';
import {updateLocalStorage, retrieveLocalStorage} from '../util/LocalStorageUtil';

const LOCAL_STORAGE_KEY = 'validationAppTestStack';
const MAX_STACK_SIZE = 100;
const initialState = retrieveLocalStorage(LOCAL_STORAGE_KEY) || {testStack: [null],testStackIndex: 0};

function setTest(state, test) {
  let testStack = [...state.testStack];
  let testStackIndex = state.testStackIndex;
  while (testStack.length > testStackIndex + 1) {
    testStack.pop();
  }
  testStack.push(test);

  while (testStack.length >= MAX_STACK_SIZE) {
    testStack.shift();
  }

  return {
    testStack: testStack,
    testStackIndex: testStack.length - 1
  };
}

export default function activeTest(state = initialState, action) {
  let newState = assign({}, state);
  switch (action.type) {
    case TestActions.SELECT_TEST:
      newState = setTest(state, action.test);
      break;
    case TestActions.CLEAR_TEST:
      newState = setTest(state, null);
      break;
    case TestActions.NEXT_TEST:
      if (state.testStackIndex >= state.testStack.length - 1) {
        return state;
      }
      newState = assign({}, state, {
        testStackIndex: state.testStackIndex + 1
      });
      break;
    case TestActions.PREV_TEST:
      if (state.testStackIndex === 0) {
        return state;
      }
      newState =  assign({}, state, {
        testStackIndex: state.testStackIndex - 1
      });
      break;
    case TestActions.RESET_STACK:
      newState = {
        testStack: [null],
        testStackIndex: 0
      };
      break;
    default:
      return state;
  }

  updateLocalStorage(LOCAL_STORAGE_KEY, newState);
  return newState;
}
