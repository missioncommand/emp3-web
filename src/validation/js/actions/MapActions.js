import keymirror from 'keymirror';

export const MapActions = keymirror({
  ADD_MAP: null,
  REMOVE_MAP: null,
  CLEAR_MAPS: null
});


export const addMap = (map) => {
  return ({
    type: MapActions.ADD_MAP,
    map: map
  });
};

export const removeMap = (mapId) => {
  return ({
    type: MapActions.REMOVE_MAP,
    mapId: mapId
  });
};

export const clearMaps = () => {
  return ({
    type: MapActions.CLEAR_MAPS
  });
};
