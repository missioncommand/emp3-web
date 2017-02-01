import keymirror from 'keymirror';

export const CameraActions = keymirror({
  ADD_CAMERA: null,
  REMOVE_CAMERA: null,
  CLEAR_CAMERAS: null
});

export const addCamera = (camera) => {
  return ({
    type: CameraActions.ADD_CAMERA,
    camera: camera
  });
};

export const removeCamera = (camera) => {
  return ({
    type: CameraActions.REMOVE_CAMERA,
    camera: camera
  });
};

export const clearCameras = () => {
  return ({
    type: CameraActions.CLEAR_CAMERAS
  });
};
