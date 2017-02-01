import keymirror from 'keymirror';

export const TestActions = keymirror({
  SELECT_TEST: null,
  CLEAR_TEST: null,
  NEXT_TEST: null,
  PREV_TEST: null,
  RESET_STACK: null
});

export const selectTest = (test) => {
  return({
    type: TestActions.SELECT_TEST,
    test
  });
};

export const clearTest = () => {
  return({
    type: TestActions.CLEAR_TEST
  });
};

export const prevTest = () => {
  return({
    type: TestActions.PREV_TEST
  });
};

export const nextTest = () => {
  return({
    type: TestActions.NEXT_TEST
  });
};

