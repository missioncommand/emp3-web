import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {VPaginatedTemplate, OverlaySelect} from '../shared';

//======================================================================================================================
let OverlayTemplate = (data) => {
  return (
    <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
      <div className='mdl-cell mdl-cell--12-col'>
        <label className='mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect' htmlFor={data.data.geoId}>
          <input id={data.data.geoId} type="checkbox" className="mdl-checkbox__input" onChange={() => data.callback(data.data.geoId)}/>
          <span className="mdl-checkbox__label">{data.data.name}</span>
        </label>
      </div>
      <div className='mdl-cell mdl-cell--12-col'>
        <span style={{fontSize:'0.7em'}}>{data.data.geoId}</span>
      </div>
      <hr/>
    </div>
  );
};

OverlayTemplate.proptTypes = {
  callback: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};
//======================================================================================================================

class OverlayAddOverlaysTest extends Component {
  constructor(props) {
    super(props);

    let selectedOverlayId = '';
    if (props.overlays.length > 0) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }
    this.state = {
      selectedOverlayId: selectedOverlayId,
      selectedOverlays: []
    };

    this.toggleOverlay = this.toggleOverlay.bind(this);
    this.addOverlays = this.addOverlays.bind(this);
    this.updateSelectedOverlayId = this.updateSelectedOverlayId.bind(this);
    this.fetchChildOverlays = this.fetchChildOverlays.bind(this);
  }

  componentDidMount() {
    if (this.state.selectedOverlayId !== '') {
      this.fetchChildOverlays();
    }
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({selectedOverlayId: _.first(props.overlays).geoId});
    }
  }

  updateSelectedOverlayId(event) {
    this.setState({selectedOverlayId: event.target.value}, this.fetchChildOverlays);
  }

  fetchChildOverlays() {
    const {overlays} = this.props;
    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});
    overlay.getOverlays({
      onSuccess: cbArgs => {
        this.setState({childOverlays: cbArgs.overlays});
      },
      onError: () => {
        toastr.error('Failed to Retrieve Child Overlays');
      }
    });
  }

  toggleOverlay(overlayId) {
    let selectedOverlays = [...this.state.selectedOverlays];
    if (_.includes(selectedOverlays, overlayId)) {
      _.pull(selectedOverlays, overlayId);
    } else {
      if (overlayId === this.state.selectedOverlayId) {
        toastr.warning('You are attempting to add an overlay as a child of itself');
      }
      selectedOverlays.push(overlayId);
    }

    this.setState({selectedOverlays: selectedOverlays});
  }

  addOverlays() {
    const {overlays, addError} = this.props;
    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});
    const childOverlays = _.filter(overlays, overlay => {
      return _.includes(this.state.selectedOverlays, overlay.geoId);
    });

    try {
      overlay.addOverlays({
        overlays: childOverlays,
        onSuccess: () => {
          toastr.success('Added Overlays to Parent Overlay');
        },
        onError: err => {
          toastr.error('Failed To Add Overlays');
          addError(err, 'Overlay.addOverlays');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Overlay.addOverlays: Critical');
    }
  }

  render() {
    const {overlays} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Overlay.addOverlays</span>
        <div className='mdl-grid'>

          <OverlaySelect overlays={overlays}
                         callback={this.updateSelectedOverlayId}
                         selectedOverlayId={this.state.selectedOverlayId}
                         className='mdl-cell mdl-cell--12-col'
                         label='Add overlays to'/>

          <VPaginatedTemplate data={overlays}
                              callback={this.toggleOverlay}
                              template={OverlayTemplate}/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.addOverlays} disabled={this.state.selectedOverlayId === ''}>
            Add Child Overlays
          </button>

          <RelatedTests relatedTests={[
            {text: 'Create Additional Overlays', target: 'createOverlayTest'}
          ]}/>
        </div>
      </div>);
  }
}

OverlayAddOverlaysTest.propTypes = {
  addError: PropTypes.func.isRequired,
  overlays: PropTypes.array.isRequired
};

export default OverlayAddOverlaysTest;
