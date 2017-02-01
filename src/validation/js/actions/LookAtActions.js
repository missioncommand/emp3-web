import keymirror from 'keymirror';

export const LookAtActions = keymirror({
  ADD_LOOKAT: null,
  REMOVE_LOOKAT: null,
  CLEAR_LOOKATS: null
});

export const addLookAt = (lookAt) => {
  return ({
    type: LookAtActions.ADD_LOOKAT,
    lookAt: lookAt
  });
};

export const removeLookAt = (lookAt) => {
  return ({
    type: LookAtActions.REMOVE_LOOKAT,
    lookAt: lookAt
  });
};

export const clearLookAts = () => {
  return ({
    type: LookAtActions.CLEAR_LOOKATS
  });
};
