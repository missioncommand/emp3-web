import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';

class OverlayGetFeaturesTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedOverlayId: (this.props.overlays.length > 0) ? this.props.overlays[0].geoId : '',
      filteredFeatures: []
    };

    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.updateFeatures = this.updateFeatures.bind(this);

    this.updateFeatures(this.state.selectedOverlayId);
  }

  updateSelectedOverlay(event) {
    this.setState({
      selectedOverlayId: event.target.value
    }, () => {
      this.updateFeatures(this.state.selectedOverlayId);
    });
  }

  updateFeatures() {
    if (this.state.selectedOverlayId !== '') {
      let overlay = _.find(this.props.overlays, {geoId:this.state.selectedOverlayId});
      overlay.getFeatures({
        onSuccess: (cbArgs) => {
          this.setState({filteredFeatures: cbArgs.features});
        },
        onError: err => {
          toastr.error('Failed to get Features for Overlay');
          this.props.addError(err, 'overlay.getFeatures');
          this.setState({
            filteredFeatures: []
          });
        }
      });
    } else {
      this.setState({
        filteredFeatures: []
      });
    }
  }

  render() {
    return (
      <div>
        <h3>Get the Features</h3>

        <label htmlFor='overlayGetFeatures-overlay'>Call getFeatures on </label>
        <select id='overlayGetFeatures-overlay' value={this.state.selectedOverlayId} onChange={this.updateSelectedOverlay}>
          {this.props.overlays.map((overlay, i) => {
            return <option key={overlay.geoId + '__' + i} value={overlay.geoId}>{overlay.name}</option>;
          })}
        </select>

        <div style={{maxHeight: window.innerHeight, overflowY:'auto'}}>
          <ul style={{listDisplay:'none', margin: 0, padding: 0}}>
            {this.state.filteredFeatures.map((feature, i) => {
              return (
                <li key={feature.geoId + '_' + i}>

                  <div style={{margin:'0 0 0 24px'}}>
                    <span>{feature.name ? feature.name : 'unnamed feature'}: {feature.type}</span> - <span style={{fontStyle:'italic'}}>{feature.geoId}</span>
                  </div>
                </li>);
            })}
            {this.state.filteredFeatures.length === 0 ? <li className='mdl-list__item'>
              <span className='mdl-list__item-primary-content'>No Features Exist On This Overlay</span>
            </li> : null}
          </ul>
        </div>


        <RelatedTests relatedTests={[
          {text: 'Create a map', target:'addMapTest'},
          {text: 'Create an overlay', target:'createOverlayTest'},
          {text: 'Create a Feature', target:'createFeatureTest'}
        ]}/>
      </div>
    );
  }
}

OverlayGetFeaturesTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  overlays: PropTypes.array.isRequired,
  maps: PropTypes.array.isRequired
};

export default OverlayGetFeaturesTest;
