import React, {Component, PropTypes} from 'react';
import {MapSelect} from '../shared';
import RelatedTests from '../../containers/RelatedTests';

class PopulateMapTest extends Component {

  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId
    };

    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.createSamples = this.createSamples.bind(this);
    this.createSamplesNoAdd = this.createSamplesNoAdd.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value});
  }

  /**
   * Creates overlays but no data
   */
  createSamplesNoAdd() {
    if (this.state.selectedMapId === '') {
      return;
    }

    const {addFeature, addOverlay} = this.props;
    const overlays = [];
    const features = [];

    const overlay1 = new emp3.api.Overlay({
      name: 'overlay 1',
      geoId: 'testOverlay1'
    });
    overlays.push(overlay1);
    addOverlay(overlay1);

    const overlay2 = new emp3.api.Overlay({
      name: 'overlay 2',
      geoId: 'testOverlay2'
    });
    overlays.push(overlay2);
    addOverlay(overlay2);

    const feature1 = new emp3.api.Point({
      name: 'feature 1',
      geoId: 'feature1',
      position: {
        latitude: 44.8,
        longitude: 43.0
      }
    });
    features.push(feature1);
    addFeature(feature1);

    const feature2 = new emp3.api.Point({
      name: 'feature 2',
      geoId: 'feature2',
      position: {
        latitude: 41.0,
        longitude: 41.5
      }
    });
    features.push(feature2);
    addFeature(feature2);

    const symbol = new emp3.api.MilStdSymbol({
      name: 'symbol 1',
      geoId: 'symbol1',
      symbolCode: 'SFGPUCI----K---',
      position: {
        latitude: 41,
        longitude: 42
      }
    });
    features.push(symbol);
    addFeature(symbol);

    const boundary = new emp3.api.MilStdSymbol({
      name: 'boundary',
      geoId: 'boundary',
      symbolCode: 'GFGPGLB----K---',
      positions: [
        {latitude: 41.1, longitude: 42.1},
        {latitude: 41.3, longitude: 42.5},
        {latitude: 40.75, longitude: 42.75}
      ]
    });
    features.push(boundary);
    addFeature(boundary);

    return {
      features: features,
      overlays: overlays
    };
  }

  createSamples() {
    if (this.state.selectedMapId === '') {
      return;
    }
    const samples = this.createSamplesNoAdd();

    const {maps, addError, addResult} = this.props;

    // Overlay1 group
    const overlay1 = samples.overlays[0];
    const feature1 = samples.features[0];
    const symbol = samples.features[3];

    // Overlay2 group
    const overlay2 = samples.overlays[1];
    const feature2 = samples.features[1];
    const boundary = samples.features[2];

    const selectedMap = _.find(maps, {geoId: this.state.selectedMapId});
    selectedMap.addOverlay({
      overlay: overlay1,
      onSuccess: (args) => {
        toastr.success('Added Overlay1 to the map');
        addResult(args);
        overlay1.addFeatures({
          features: [feature1, symbol],
          onSuccess: () => {
            toastr.success('Added features to Overlay1');            
          },
          onError: (err) => {
            addError(err);
            toastr.success('Failed to add feature1 and symbol to Overlay1');
          }
        });
      },
      onError: (err) => {
        addError(err);
        toastr.success('Failed to add Overlay1 to the map');
      }
    });

    selectedMap.addOverlay({
      overlay: overlay2,
      onSuccess: () => {
        toastr.success('Added Overlay1 to the map');
        overlay2.addFeatures({
          features: [feature2, boundary],
          onSuccess: () => {
            toastr.success('Added feature2 and boundary to Overlay2');
          },
          onError: () => {
            toastr.success('Failed to add feature2 and boundary to Overlay2');
          }
        });
      },
      onError: () => {
        toastr.error('Failed to add overlay 2 to the map');
      }
    });
  }

  render() {

    const {maps} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Populate Map</span>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <MapSelect id='samples-map' selectedMapId={this.state.selectedMapId} maps={maps}
                       label='Select which map to apply samples to ' callback={this.updateSelectedMap}/>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createSamples}
            disabled={maps.length === 0}>
            Populate Map
          </button>

          <label htmlFor='createData'>Create data but don't add to map</label>
          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createSamplesNoAdd}>
            Create Data
          </button>

          <RelatedTests relatedTests={[]}/>
        </div>
      </div>
    );
  }
}

PopulateMapTest.propTypes = {
  maps: PropTypes.array.isRequired,
  addOverlay: PropTypes.func.isRequired,
  addFeature: PropTypes.func.isRequired,
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired
};

export default PopulateMapTest;
