import GeoContainers from '../components/GeoContainers';
import {connect} from 'react-redux';

const mapStateToProps = state => {
  return {
    containers: state.overlays
  };
};

export const Overlays = connect(
  mapStateToProps
)(GeoContainers);
