import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../../containers/RelatedTests';

class CreateImageLayerTest extends Component {

  createImageLayer() {

  }

  createImageLayerAddToMap() {

  }

  createImageLayerAddToOverlay() {

  }

  render() {
    return (
      <div id='createImageLayer' className='inactiveTest'>
        <h3>Create an Image Layer</h3>

        <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
          <input className='mdl-textfield__input' type='text' id='createImageLayer-name'/>
          <label className='mdl-textfield__label' htmlFor='createImageLayer-name'>Name</label>
        </div>
        <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
          <input className='mdl-textfield__input' type='text' id='createImageLayer-id'/>
          <label className='mdl-textfield__label' htmlFor='createImageLayer-id'>ID</label>
        </div>
        <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
          <input className='mdl-textfield__input' type='text' id='createImageLayer-url'/>
          <label className='mdl-textfield__label' htmlFor='createImageLayer-url'>URL</label>
        </div>
        <label htmlFor='createImageLayer-menuId'>Select which menu to attach to this layer</label>
        <select id='createImageLayer-menuId' className='blocky'>
          <option value=''>None</option>
        </select>
        <div className='blocky' id='createImageLayer-params'>
          <h3>Params</h3>
          <div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createImageLayer-bottom'/>
              <label className='mdl-textfield__label' htmlFor='createImageLayer-bottom'>Bottom</label>
            </div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createImageLayer-top'/>
              <label className='mdl-textfield__label' htmlFor='createImageLayer-top'>Top</label>
            </div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createImageLayer-left'/>
              <label className='mdl-textfield__label' htmlFor='createImageLayer-left'>Left</label>
            </div>
            <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
              <input className='mdl-textfield__input' type='text' id='createImageLayer-right'/>
              <label className='mdl-textfield__label' htmlFor='createImageLayer-right'>Right</label>
            </div>
          </div>
        </div>
        <button
          className='blocky addButton mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
          onClick={this.createImageLayer}>
          Create
        </button>
        <button
          className='blocky addButton mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
          onClick={this.createImageLayerAddToMap}>
          Add Layer to Map
        </button>
        <button
          className='blocky addButton mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
          onClick={this.createImageLayerAddToOverlay}>
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

CreateImageLayerTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired
};

export default CreateImageLayerTest;