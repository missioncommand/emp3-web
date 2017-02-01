import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../../containers/RelatedTests';

class CreateLayerTest extends Component {

  createLayer() {

  }

  createLayerAddToMap() {

  }

  render() {
    return (
      <div id='createLayer' className='inactiveTest'>
        <h3>Create a Layer</h3>

        This is for a generic layer class and should be used for formats other than kml, wms and images. This test just
        makes sure that the Layer constructor will work.
        <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
          <input className='mdl-textfield__input' type='text' id='createLayer-name'/>
          <label className='mdl-textfield__label' htmlFor='createLayer-name'>Name</label>
        </div>
        <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
          <input className='mdl-textfield__input' type='text' id='createLayer-id'/>
          <label className='mdl-textfield__label' htmlFor='createLayer-id'>ID</label>
        </div>
        <label htmlFor='createLayer-menuId'>Select which menu to attach to this layer</label>
        <select id='createLayer-menuId' className='blocky'>
          <option value=''>None</option>
        </select>
        <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
          <textarea className='mdl-textfield__input' type='text' rows='10' id='createLayerParams'></textarea>
          <label className='mdl-textfield__label' htmlFor='createLayerParams'>Params</label>
        </div>
        <div className='blocky mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
          <textarea className='mdl-textfield__input' type='text' rows='10' id='createLayerProperties'></textarea>
          <label className='mdl-textfield__label' htmlFor='createLayerProperties'>Properties</label>
        </div>
        <button
          className='blocky addButton mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
          onClick={this.createLayer}>
          Create Layer
        </button>
        <button
          className='blocky addButton mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
          onClick={this.createLayerAddToMap}>
          Add this Layer to map
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

CreateLayerTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired
};

export default CreateLayerTest;