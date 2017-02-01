import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';

class MapClearTest extends Component {

  mapClear() {

  }

  render() {
    return (
      <div id='mapClear' className='inactiveTest'>

        <h3>Clear everything from the map</h3>

        <label htmlFor='mapClear-map'>Select which map to clear selected features</label>
        <select id='mapClear-map' className='blocky'>
        </select>

        <button className='blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                onClick={this.mapClear}>
          Clear Selected Features
        </button>

        <RelatedTests relatedTests={[
        {text:'Create an overlay', target:'createOverlayTest'},
        {text:'Add an existing overlay to a map', target:'mapAddOverlayTest'}
        ]}/>
      </div>
    );
  }
}

MapClearTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired
};

export default MapClearTest;
