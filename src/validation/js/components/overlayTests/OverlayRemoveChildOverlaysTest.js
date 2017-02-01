import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';

class RemoveChildOverlaysTest extends Component {
  constructor(props) {
    super(props);

    let selectedOverlayId = '';
    if (props.overlays.length) {
      const overlay = _.first(props.overlays);
      selectedOverlayId = overlay.geoId;
      overlay.getOverlays({
        onSuccess: cbArgs => {
          this.setState({
            childOverlays: cbArgs.overlays
          });
        },
        onError: err => {
          toastr.error('Failed To Get Child Overlays');
          this.props.addError(err, 'overlay.getOverlays');
          this.setState({
            selectedOverlayId: '',
            childOverlays: []
          });
        }
      });
    }

    this.state = {
      selectedOverlayId: selectedOverlayId,
      childOverlays: []
    };

    this.updateSelectedOverlayId = this.updateSelectedOverlayId.bind(this);
    this.removeOverlay = this.removeOverlay.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      const overlay = _.first(props.overlays);
      try {
        overlay.getOverlays({
          onSuccess: cbArgs => {
            this.setState({
              selectedOverlayId: overlay.geoId,
              childOverlays: cbArgs.overlays
            });
          },
          onError: err => {
            toastr.error('Error retrieving child overlays');
            props.addError(err, 'getOverlays');
            this.setState({
              selectedOverlayId: '',
              childOverlays: []
            });
          }
        });
      } catch (err) {
        toastr.error(err.message, 'Failed to get Child Overlays');
        this.setState({
          selectedOverlayId: '',
          childOverlays: []
        });
      }
    }
  }

  updateSelectedOverlayId(event) {
    const overlay = _.find(this.props.overlays, {geoId: event.target.value});
    try {
      overlay.getOverlays({
        onSuccess: cbArgs => {
          this.setState({
            selectedOverlayId: overlay.geoId,
            childOverlays: cbArgs.overlays
          });
        },
        onError: err => {
          toastr.error('Error retrieving child overlays');
          this.props.addError(err, 'getOverlays');
          this.setState({
            selectedOverlayId: '',
            childOverlays: []
          });
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Failed to get Child Overlays');
      this.setState({
        selectedOverlayId: '',
        childOverlays: []
      });
    }
  }

  removeOverlay(overlayId) {
    const parentOverlay = _.find(this.props.overlays, {geoId: this.state.selectedOverlayId});
    const overlay = _.find(this.props.overlays, {geoId: overlayId});

    try {
      parentOverlay.removeOverlay({
        overlay: overlay,
        onSuccess: () => {
          toastr.success('Removed Child Overlay');
          this.props.removeOverlay(overlay);
          let updatedOverlays = [...this.state.childOverlays];
          _.remove(updatedOverlays, overlay);
          this.setState({childOverlays: updatedOverlays});
        },
        onError: (err) => {
          toastr.error('Failed To Remove Child Overlay');
          this.props.addResult(err, 'overlay.removeOverlay');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Failed To Remove Child Overlay: Critical');
      this.props.addError(err.message, 'overlay.removeOverlay:Critical');
    }
  }

  render() {
    return (
      <div>
        <h3>Remove Child Overlays From An Overlay</h3>

        <label htmlFor='overlaySelect'>Remove Overlays From </label>
        <select id='overlaySelect' value={this.state.selectedOverlayId} onChange={this.updateSelectedOverlayId}>
          {this.props.overlays.map(overlay => {
            return <option key={overlay.geoId} value={overlay.geoId}>{overlay.name}</option>;
          })}
        </select>

        <div>
          <h5>Child Overlays</h5>
          <ul className='mdl-list' style={{minHeight: '200px', maxHeight: '200px', overflowY: 'auto'}}>
            {this.state.childOverlays.map(overlay => {
              return (
                <li key={overlay.geoId + '_child'} className='mdl-list__item mdl-list__item--two-line'>
                  <span className='mdl-list__item-primary-content'>
                    {overlay.name}
                    <span className='mdl-list__item-sub-title'>{overlay.geoId}</span>
                  </span>
                  <span className='mdl-list__item-secondary-action'>
                    <button className='mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab'
                            onClick={() => this.removeOverlay(overlay.geoId)}>
                      <i className='fa fa-times'/>
                    </button>
                  </span>
                </li>);
            })}
            {this.state.selectedOverlayId !== '' && this.state.childOverlays.length === 0 ? <li className='mdl-list__item'>
              <span className='mdl-list__item-primary-content'>No child overlays</span>
            </li> : null}
          </ul>
        </div>

        <RelatedTests relatedTests={[
          {text: 'Create a map', target:'addMapTest'},
          {text: 'Create an overlay', target:'createOverlayTest'},
          {text: 'Create a Feature', target:'createFeatureTest'}
        ]}/>
      </div>);
  }
}

RemoveChildOverlaysTest.propTypes = {
  addError: PropTypes.func.isRequired,
  addResult: PropTypes.func.isRequired,
  overlays: PropTypes.array.isRequired,
  removeOverlay: PropTypes.func.isRequired
};

export default RemoveChildOverlaysTest;
