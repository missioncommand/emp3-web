import GeoContainers from '../components/GeoContainers';
import {connect} from 'react-redux';

const mapStateToProps = state => {
  return {
    containers: state.features
  };
};

export const Features = connect(
  mapStateToProps
)(GeoContainers);
