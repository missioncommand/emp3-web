import {FeatureActions} from '../actions/FeatureActions';

const initialState = [];

export default function features(state = initialState, action) {
  let newState = [...state];
  switch (action.type) {
    case FeatureActions.ADD_FEATURE:
      newState = [...state, action.feature];
      break;
    case FeatureActions.ADD_FEATURES:
      newState = _.concat(state, action.features);
      break;
    case FeatureActions.REMOVE_FEATURE:
      _.pull(newState, action.feature);
      break;
    case FeatureActions.REMOVE_FEATURES:
      _.pullAll(newState, action.features);
      break;
    case FeatureActions.CLEAR_FEATURES:
      return [];
    default:
      return state;
  }
  return newState;
}
