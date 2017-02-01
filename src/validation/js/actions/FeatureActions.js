import keymirror from 'keymirror';

export const FeatureActions = keymirror({
  ADD_FEATURE: null,
  ADD_FEATURES: null,
  REMOVE_FEATURE: null,
  REMOVE_FEATURES: null,
  CLEAR_FEATURES: null
});

export const addFeature = (feature) => {
  return {
    type: FeatureActions.ADD_FEATURE,
    feature: feature
  };
};

export const addFeatures = (features) => {
  return {
    type: FeatureActions.ADD_FEATURES,
    features: features
  };
};

export const removeFeature = (feature) => {
  return {
    type: FeatureActions.REMOVE_FEATURE,
    feature: feature
  };
};

export const removeFeatures = (features) => {
  return {
    type: FeatureActions.REMOVE_FEATURES,
    features: features
  };
};

export const clearFeatures = () => {
  return {
    type: FeatureActions.CLEAR_FEATURES
  };
};
