import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';

class MapGetFeaturesTest extends Component {

  mapGetFeatures() {

  }

  render() {
    return (
      <div id='mapGetFeatures' className='inactiveTest'>
        <h3>Get all Features</h3>

        <label htmlFor='mapGetFeatures-map'>Select which map's features you want</label>
        <select id='mapGetFeatures-map' className='blocky'>
        </select>

        <button className='blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                onClick={this.mapGetFeatures}>
          Get Features
        </button>

        <RelatedTests relatedTests={[
          {text: 'Create a map', target: 'addMapTest'},
          {text: 'Create an overlay', target: 'createOverlayTest'},
          {text: 'Create a feature', target: 'createFeatureTest'},
          {text: 'Create a symbol', target: 'createSymbolTest'},
          {text: 'Get all overlays', target: 'mapGetOverlaysTest'}
        ]}/>
      </div>
    );
  }
}

MapGetFeaturesTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired
};

export default MapGetFeaturesTest;