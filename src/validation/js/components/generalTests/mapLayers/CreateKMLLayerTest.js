import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../../containers/RelatedTests';

class CreateKMLLayerTest extends Component {

  createKMLLayer() {

  }

  createKMLLayerAddToMap() {

  }

  createKMLLayerAddToOverlay() {

  }

  render() {
    return (
      <div id='createKMLLayer' className='inactiveTest'>
        <h3>Create a KML Layer</h3>
        <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
          <input className='mdl-textfield__input' type='text' id='createKMLLayer-name'/>
          <label className='mdl-textfield__label' htmlFor='createKMLLayer-name'>Name</label>
        </div>
        <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
          <input className='mdl-textfield__input' type='text' id='createKMLLayer-id'/>
          <label className='mdl-textfield__label' htmlFor='createKMLLayer-id'>ID</label>
        </div>
        <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
          <input className='mdl-textfield__input' type='text' id='createKMLLayer-url'/>
          <label className='mdl-textfield__label' htmlFor='createKMLLayer-url'>URL</label>
        </div>
        <label htmlFor='createKMLLayer-menuId'>Select which menu to attach to this layer</label>
        <select id='createKMLLayer-menuId' className='blocky'>
          <option value=''>None</option>
        </select>
        <div className='blocky' id='createKMLLayer-params'>
          <h3>Params</h3>
          <div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createKMLLayer-refreshMode'/>
              <label className='mdl-textfield__label' htmlFor='createKMLLayer-refreshMode'>Layers</label>
            </div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createKMLLayer-refreshInterval'/>
              <label className='mdl-textfield__label' htmlFor='createKMLLayer-refreshInterval'>Refresh Interval</label>
            </div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createKMLLayer-viewRefreshMode'/>
              <label className='mdl-textfield__label' htmlFor='createKMLLayer-viewRefreshMode'>View Refresh Mode</label>
            </div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createKMLLayer-viewRefreshTime'/>
              <label className='mdl-textfield__label' htmlFor='createKMLLayer-viewRefreshTime'>View Refresh Time</label>
            </div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createKMLLayer-viewBoundScale'/>
              <label className='mdl-textfield__label' htmlFor='createKMLLayer-viewBoundScale'>View Bound Scale</label>
            </div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createKMLLayer-viewFormat'/>
              <label className='mdl-textfield__label' htmlFor='createKMLLayer-viewFormat'>View Format</label>
            </div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createKMLLayer-httpQuery'/>
              <label className='mdl-textfield__label' htmlFor='createKMLLayer-httpQuery'>HTTP Query</label>
            </div>
          </div>
        </div>
        <button
          className='blocky addButton mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
          onClick={this.createKMLLayer}>
          Create
        </button>
        <button
          className='blocky addButton mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
          onClick={this.createKMLLayerAddToMap}>
          Add Layer to Map
        </button>
        <button
          className='blocky addButton mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
          onClick={this.createKMLLayerAddToOverlay}>
          Add Layer to Overlay
        </button>

        <RelatedTests relatedTests={[
        {text: 'Add this layer to a map'},
        {text: 'Add this layer to an overlay'},
        {text: 'Create an overlay', target: 'createOverlayTest'},
        {text: 'Change layer visibility'}
        ]}/>
      </div>
    );
  }
}

CreateKMLLayerTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired
};

export default CreateKMLLayerTest;