/* globals empConfig */

import React, {Component, PropTypes} from 'react';
import VText from '../shared/VText';
import RelatedTests from '../../containers/RelatedTests';

/**
 * If this test loads first, we may not have the empConfig values loaded yet,
 * this will be run during componentDidMount and will call itself until the configs are loaded
 */
const checkForConfig = function() {
  if (!empConfig.engines) {
    setTimeout(checkForConfig, 100);
  } else {
    let initialMapEngineId = empConfig.startMapEngineId;
    this.setState({
      selectedMapEngineConfig: _.find(empConfig.engines, {mapEngineId: initialMapEngineId})
    });
  }
};

class swapMapEngineTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedMapId: props.maps.length > 0 ? _.first(props.maps).geoId : '',
      selectedMapEngineConfig: undefined
    };

    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.updateSelectedMapEngine = this.updateSelectedMapEngine.bind(this);
    this.updateMapEngine = this.updateMapEngine.bind(this);
    this.swapMap = this.swapMap.bind(this);
  }

  componentDidMount() {
    // Wait for the empConfig to finish loading
    checkForConfig.call(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length && this.state.selectedMapId === '') {
      this.setState({
        selectedMapId: _.first(props.maps).geoId
      });
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value});
  }

  updateSelectedMapEngine(event) {
    this.setState({selectedMapEngineConfig: _.find(empConfig.engines, {mapEngineId: event.target.value})});
  }

  updateMapEngine(key, value) {
    let engine = {...this.state.selectedMapEngineConfig};
    engine[key] = value;
    this.setState({selectedMapEngineConfig: engine});
  }

  swapMap() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    try {
      map.swapMapEngine({
        engine: this.state.selectedMapEngineConfig,
        onSuccess: () => {
          toastr.success('Swapped Map');
        },
        onError: err => {
          toastr.error('Failed to Swap Map');
          this.props.addError(err, 'Map.swapMapEngine');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Map.swapMapEngine: Critical');
    }
  }

  render() {
    const availableEngines = _.map(empConfig.engines, 'mapEngineId');

    let mapEngineId, engineBasePath, manifestName;
    if (this.state.selectedMapEngineConfig) {
      mapEngineId = this.state.selectedMapEngineConfig.mapEngineId || '';
      engineBasePath = this.state.selectedMapEngineConfig.engineBasePath || '';
      manifestName = this.state.selectedMapEngineConfig.manifestName || '';
    }

    return (
      <div>
        <h3>Swap Maps</h3>
        <h5>Maps</h5>
        <ul className='mdl-list' style={{maxHeight: '500px', overflowY: 'auto'}}>
          <div className='mdl-grid'>
            <label htmlFor='mapAddEventListeners-map'>Select which map to swap.</label>
            <select className='blocky' id='mapAddEventListeners-map' onChange={this.updateSelectedMap}
                    value={this.state.selectedMapId}>
              <option value=''>None</option>
              {this.props.maps.map(map => {
                return <option key={map.geoId} value={map.geoId}>{map.container}</option>;
              })}
            </select>
          </div>
        </ul>
        <h5>Engines</h5>
        <ul className='mdl-list' style={{maxHeight: '500px', overflowY: 'auto'}}>
          <div className='mdl-grid'>
            <label htmlFor='updateSelectedMapEngine'>Select which engine to use.</label>
            <select className='blocky' id='updateSelectedMapEngine' onChange={this.updateSelectedMapEngine}
                    value={mapEngineId}>
              {availableEngines.map(engines => {
                return <option key={engines} value={engines}>{engines}</option>;
              })}
            </select>
          </div>
        </ul>
        <VText id='mapEngine-engineBasePath' label="Engine Base Path"
               value={engineBasePath} callback={(event) => {
          this.updateMapEngine('engineBasePath', event.target.value);
        }}/>
        <VText id='mapEngine-manifestName' label="Manifest Name" value={manifestName}
               callback={(event) => {
                 this.updateMapEngine('manifestName', event.target.value);
               }}/>
        { // Only render this once we have the engine config available
          this.state.selectedMapEngineConfig ? (
            <div>
              <VText id='mapEngine-mapEngineId' label="Map Engine Id"
                     value={this.state.selectedMapEngineConfig.mapEngineId}
                     callback={(event) => {
                       this.updateMapEngine('mapEngineId', event.target.value);
                     }}/>

              <button
                className="blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored"
                disabled={engineBasePath.length === 0 || mapEngineId.length === 0}
                onClick={this.swapMap}>
                Swap
              </button>
            </div>) : null
        }
        <RelatedTests relatedTests={[
          {text: 'Create a map', target: 'addMapTest'}
        ]}/>
      </div>
    );
  }
}


swapMapEngineTest.propTypes = {
  addError: PropTypes.func.isRequired,
  addResult: PropTypes.func.isRequired,
  maps: PropTypes.array.isRequired
};

export default swapMapEngineTest;
