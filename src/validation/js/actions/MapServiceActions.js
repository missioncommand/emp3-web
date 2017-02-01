import keymirror from 'keymirror';

export const MapServiceActions = keymirror({
  ADD_MAPSERVICE: null,
  REMOVE_MAPSERVICES: null,
  CLEAR_MAPSERVICES: null
});

export const addMapService = (mapService) => {
  return {
    type: MapServiceActions.ADD_MAPSERVICE,
    mapService: mapService
  };
};

export const removeMapServices = (mapServices) => {
  return {
    type: MapServiceActions.REMOVE_MAPSERVICES,
    mapServices: mapServices
  };
};

export const clearMapServices = () => {
  return {
    type: MapServiceActions.CLEAR_MAPSERVICES
  };
};
