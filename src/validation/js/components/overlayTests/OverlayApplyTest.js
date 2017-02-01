import React, {Component,PropTypes} from 'react';
import {RelatedTests} from '../../containers';
import {VText, OverlaySelect} from '../shared';
import assign from 'object-assign';

class OverlayApplyTest extends Component {
  constructor(props) {
    super(props);

    let selectedOverlayId = '';
    let overlay = {};
    if (props.overlays.length > 0) {
      overlay = _.first(props.overlays);
      selectedOverlayId = overlay.geoId;
    }

    this.state = {
      selectedOverlayId: selectedOverlayId,
      childOverlays: [],
      overlay: {...overlay}
    };

    this.applyUpdates = this.applyUpdates.bind(this);
    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.updateOverlay = this.updateOverlay.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      let overlay = _.first(props.overlays);
      this.setState({
        selectedOverlayId: overlay.geoId,
        overlay: {...overlay}
      });
    }
  }

  updateSelectedOverlay(event) {
    if (event.target.value !== '') {
      let overlay = _.find(this.props.overlays, {geoId: event.target.value});
      this.setState({
        selectedOverlayId: event.target.value,
        overlay: {...overlay}
      });
    } else {
      this.setState({
        selectedOverlayId: event.target.value,
        overlay: {}
      });
    }
  }

  updateOverlay(event) {
    let prop = event.target.id.split('-')[1];
    let overlay = {...this.state.overlay};

    if (prop === 'readOnly') {
      overlay[prop] = event.target.checked;
    } else {
      overlay[prop] = event.target.value;
      this.setState({overlay: overlay});
    }
  }

  applyUpdates() {
    let original = _.find(this.props.overlays, {geoId: this.state.selectedOverlayId});
    try {
      // Make deep copy with the modifications
      let overlayCopy = assign(original, this.state.overlay);

      overlayCopy.apply({
        onSuccess: (cbArgs) => {
          original = cbArgs.overlay; // Update the `original` with the new value
          toastr.success('Applied changes Successfully');
          // this.forceUpdate(); // TODO this doesn't update the OverlaySelect values, figure out how to have that update
        },
        onError: err => {
          this.props.addError(err, 'Overlay.apply');
          toastr.error('Failed to apply changes');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Overlay.apply: Critical');
    }
  }

  render() {
    return (
      <div className='mdl-grid'>
        <span className='mdl-layout-title'>Apply Updates To Overlays</span>
        <div className='mdl-cell mdl-cell--12-col'>
          <OverlaySelect label='Update ' selectedOverlayId={this.state.selectedOverlayId} overlays={this.props.overlays}
                         callback={this.updateSelectedOverlay}/>

          <h5>Overlay Values</h5>

          <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored'
                  onClick={this.applyUpdates} disabled={this.state.selectedOverlayId === ''}>
                  Apply
          </button>

          <VText id='overlay-name' value={this.state.overlay.name} label='Name' callback={this.updateOverlay}/>
          <VText id='overlay-geoId' value={this.state.overlay.geoId} label='GeoId' readOnly={true}/>
          <VText id='overlay-description' value={this.state.overlay.description} label='Description' callback={this.updateOverlay}/>

          <RelatedTests relatedTests={[

          ]}/>
        </div>
      </div>
    );
  }
}

OverlayApplyTest.propTypes = {
  overlays: PropTypes.array.isRequired,
  addError: PropTypes.func.isRequired
};

export default OverlayApplyTest;
