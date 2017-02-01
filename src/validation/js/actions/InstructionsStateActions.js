import keymirror from 'keymirror';

export const InstructionsStateActions = keymirror({
  TOGGLE_INSTRUCTIONS:null
});

export const toggleInstructions = (id) => {
  return ({
    type: InstructionsStateActions.TOGGLE_INSTRUCTIONS,
    testId: id
  });
};
