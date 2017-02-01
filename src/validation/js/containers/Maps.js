import GeoContainers from '../components/GeoContainers';
import {connect} from 'react-redux';

const mapStateToProps = state => {
  return {
    containers: state.maps
  };
};

export const Maps = connect(
  mapStateToProps
)(GeoContainers);
