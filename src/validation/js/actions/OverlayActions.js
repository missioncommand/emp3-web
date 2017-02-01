import keymirror from 'keymirror';

export const OverlayActions = keymirror({
  ADD_OVERLAY: null,
  ADD_OVERLAYS: null,
  REMOVE_OVERLAY: null,
  REMOVE_OVERLAYS: null,
  CLEAR_OVERLAYS: null
});

export const addOverlay = (overlay) => {
  return {
    type: OverlayActions.ADD_OVERLAY,
    overlay: overlay
  };
};

export const addOverlays = (overlays) => {
  return {
    type: OverlayActions.ADD_OVERLAYS,
    overlays: overlays
  };
};

export const removeOverlay = (overlay) => {
  return {
    type: OverlayActions.REMOVE_OVERLAY,
    overlay: overlay
  };
};

export const removeOverlays = (overlays) => {
  return {
    type: OverlayActions.REMOVE_OVERLAYS,
    overlays: overlays
  };
};

export const clearOverlays = () => {
  return {
    type: OverlayActions.CLEAR_OVERLAYS
  };
};
