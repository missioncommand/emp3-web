import React, {Component, PropTypes} from 'react';
import {RelatedTests} from '../../containers';
import {OverlaySelect} from '../shared';

class OverlayClearContainerTest extends Component {
  constructor(props) {
    super(props);

    let selectedOverlayId = '';
    if (props.overlays.length > 0) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }
    this.state = {
      selectedOverlayId: selectedOverlayId
    };

    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.clearContainer = this.clearContainer.bind(this);
    this.fetchChildren = this.fetchChildren.bind(this);
  }

  componentDidMount() {
    if (this.state.selectedOverlayId !== '') {
      this.fetchChildren();
    }
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({selectedOverlayId: _.first(props.overlays).geoId}, this.fetchChildren);
    }
  }

  fetchChildren() {
    const overlay = _.find(this.props.overlays, {geoId: this.state.selectedOverlayId});
    overlay.getChildren({
      onSuccess: cbArgs => {
        this.setState({
          features: cbArgs.features,
          overlays: cbArgs.overlays
        });
      },
      onError: () => {
        toastr.error('Failed to Fetch Children');
      }
    });
  }

  updateSelectedOverlay(event) {
    this.setState({selectedOverlayId: event.target.value}, this.fetchChildren);
  }

  clearContainer() {
    const overlay = _.find(this.props.overlays, {geoId: this.state.selectedOverlayId});
    overlay.clearContainer({
      onSuccess: () => {
        toastr.success('Cleared the Overlay');
      },
      onError: err => {
        this.props.addError(err, 'Overlay.clearContainer');
        toastr.error('Failed to clear the Overlay');
      }
    });
  }

  render() {
    return (
      <div className='mdl-grid'>
        <div className='mdl-cell mdl-cell--12-col'>
          <span className='mdl-layout-title'>Clear Overlay Container</span>
          <OverlaySelect selectedOverlayId={this.state.selectedOverlayId} callback={this.updateSelectedOverlay}
                         label='Select Overlay '></OverlaySelect>

          <button className='mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored'
                  onClick={this.clearContainer} disabled={this.state.selectedOverlayId === ''}>
                  Clear Container
          </button>

          <RelatedTests relatedTests={[

          ]}/>
        </div>
      </div>);
  }
}

OverlayClearContainerTest.propTypes = {
  overlays: PropTypes.array.isRequired,
  addError: PropTypes.func.isRequire
};

export default OverlayClearContainerTest;
