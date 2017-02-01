import keymirror from 'keymirror';

export const ControlPanelActions = keymirror({
  TOGGLE_TEST_GROUP: null,
  OPEN_TEST_GROUP: null,
  CLOSE_TEST_GROUP: null
});

export const toggleGroup = id => {
  return ({
    type: ControlPanelActions.TOGGLE_TEST_GROUP,
    id: id
  });
};

export const openGroup = id => {
  return ({
    type: ControlPanelActions.OPEN_TEST_GROUP,
    id: id
  });
};

export const closeGroup = id => {
  return ({
    type: ControlPanelActions.CLOSE_TEST_GROUP,
    index: id
  });
};
