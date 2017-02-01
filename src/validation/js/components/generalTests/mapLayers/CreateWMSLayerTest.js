import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../../containers/RelatedTests';

class CreateWMSLayerTest extends Component {

  createWMSLayer() {

  }

  createWMSLayerAddToMap() {

  }

  createWMSLayerAddToOverlay() {

  }

  render() {
    return (
      <div id='createWMSLayer' className='inactiveTest'>
        <h3>Create a WMS Layer</h3>

        <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
          <input className='mdl-textfield__input' type='text' id='createWMSLayer-name'/>
          <label className='mdl-textfield__label' htmlFor='createWMSLayer-name'>Name</label>
        </div>
        <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
          <input className='mdl-textfield__input' type='text' id='createWMSLayer-id'/>
          <label className='mdl-textfield__label' htmlFor='createWMSLayer-id'>ID</label>
        </div>
        <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
          <input className='mdl-textfield__input' type='text' id='createWMSLayer-url'/>
          <label className='mdl-textfield__label' htmlFor='createWMSLayer-url'>URL</label>
        </div>
        <label htmlFor='createWMSLayer-menuId'>Select which menu to attach to this layer</label>
        <select id='createWMSLayer-menuId' className='blocky'>
          <option value=''>None</option>
        </select>
        <div className='blocky' id='createWMSLayer-params'>
          <h3>Params</h3>
          <div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createWMSLayer-layers'/>
              <label className='mdl-textfield__label' htmlFor='createWMSLayer-layers'>Layers</label>
            </div>
            <div className='blocky mdl-checkbox'>
              <input type='checkbox' id='createWMSLayer-transparent' className='mdl-checkbox__input'/>
              <label className='mdl-checkbox__label' htmlFor='createWMSLayer-transparent'>Transparent</label>
            </div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createWMSLayer-styles'/>
              <label className='mdl-textfield__label' htmlFor='createWMSLayer-styles'>Styles</label>
            </div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createWMSLayer-format'/>
              <label className='mdl-textfield__label' htmlFor='createWMSLayer-format'>Format</label>
            </div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createWMSLayer-bgcolor'/>
              <label className='mdl-textfield__label' htmlFor='createWMSLayer-bgcolor'>Background Color</label>
            </div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createWMSLayer-time'/>
              <label className='mdl-textfield__label' htmlFor='createWMSLayer-time'>Time</label>
            </div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createWMSLayer-elevation'/>
              <label className='mdl-textfield__label' htmlFor='createWMSLayer-elevation'>Elevation</label>
            </div>
          </div>
        </div>
        <button
          className='blocky addButton mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
          onClick={this.createWMSLayer}>
          Create
        </button>
        <button
          className='blocky addButton mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
          onClick={this.createWMSLayerAddToMap}>
          Add Layer to Map
        </button>
        <button
          className='blocky addButton mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
          onClick={this.createWMSLayerAddToOverlay}>
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

CreateWMSLayerTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired
};

export default CreateWMSLayerTest;