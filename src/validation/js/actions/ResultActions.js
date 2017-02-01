import keymirror from 'keymirror';

export const ResultActions = keymirror({
  ADD_RESULT: null,
  ADD_ERROR: null,
  REMOVE_RESULT: null,
  CLEAR_RESULTS: null
});

export const addResult = (result, source) => {
  return ({
    type: ResultActions.ADD_RESULT,
    result: result,
    source: source
  });
};

export const addError = (result, source) => {
  return ({
    type: ResultActions.ADD_ERROR,
    result: result,
    source: source
  });
};

export const removeResult = (index) => {
  return ({
    type: ResultActions.REMOVE_RESULT,
    index: index
  });
};

export const clearResults = () => {
  return ({
    type: ResultActions.CLEAR_RESULTS
  });
};
