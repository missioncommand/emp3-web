import React, {Component, PropTypes} from 'react';
import {OverlaySelect} from '../shared';
import {RelatedTests} from '../../containers';

class OverlayGetOverlaysTest extends Component {
  constructor(props) {
    super(props);

    let selectedOverlayId = '';
    if (props.overlays.length > 0) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }
    this.state = {
      selectedOverlayId: selectedOverlayId,
      childOverlays: []
    };

    this.getOverlays = this.getOverlays.bind(this);
    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
  }

  componentDidMount() {
    this.getOverlays();
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({
        selectedOverlayId: _.first(props.overlays).geoId,
        childOverlays: []
      }, this.getOverlays);
    }
  }

  updateSelectedOverlay(event) {
    this.setState({
      selectedOverlayId: event.target.value,
      childOverlays: []
    }, this.getOverlays);
  }

  getOverlays() {
    if (this.state.selectedOverlayId === '') {
      return;
    }

    const overlay = _.find(this.props.overlays, {geoId: this.state.selectedOverlayId});
    try {
      overlay.getOverlays({
        onSuccess: cbArgs => {
          this.setState({childOverlays: cbArgs.overlays});
          toastr.success('Successfully Retrieved Overlays ('+ cbArgs.overlays.length +')');
        },
        onError: err => {
          toastr.error('Failed to get child overlays');
          this.props.addError(err, 'Overlay.getOverlays');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Overlay.getOverlays: Critical');
    }
  }

  render() {
    return (
      <div className='mdl-grid'>
        <span className='mdl-layout-title'>Get Child Overlays</span>
        <div className='mdl-cell mdl-cell--12-col'>
          <OverlaySelect selectedOverlayId={this.state.selectedOverlayId} callback={this.updateSelectedOverlay}/>
          <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect'
                  onClick={this.getOverlays} disabled={this.state.selectedOverlayId === ''}>
            Get Overlays
          </button>

          <h5>Child Overlays</h5>
          <ul className='mdl-list'>
            {this.state.childOverlays.length === 0 ? <li>
              This overlay has no child overlays
            </li> : null}
            {this.state.childOverlays.map(overlay => {
              return (<li key={overlay.geoId}>
                {overlay.geoId} <span style={{fontSize:'0.7em'}}>{overlay.name}</span>
              </li>);
            })}
          </ul>

          <RelatedTests relatedTests={[
            {text: 'Create Additional Overlays', target: 'createOverlayTest'},
            {text: 'Add Child Overlays', target: 'overlayAddOverlaysTest'},
            {text: 'Remove Overlays', target: 'overlayRemoveOverlaysTest'}
          ]}/>
        </div>
      </div>);
  }
}

OverlayGetOverlaysTest.propTypes = {
  addError: PropTypes.func.isRequired,
  overlays: PropTypes.array.isRequired
};

export default OverlayGetOverlaysTest;
