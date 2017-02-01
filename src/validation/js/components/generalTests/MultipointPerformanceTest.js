import React, {Component, PropTypes} from 'react';
import {VText, MapSelect} from '../shared';
import {createRandomPositions} from '../../util/LocationGen.js';

class MultipointPerformanceTest extends Component {
  constructor(props) {
    super(props);

    var selectedMapId = '';

    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      count: 1000,
      overlay: new emp3.api.Overlay({
        geoId: 'multipoint performance test',
        name: 'multipoint performance test'
      }),
      createTime: '',
      loadTime: '',
      running: false,
      featureNumber: 0,
      symbolCode: "GFGPGLB----H--X",
      numberAdded: 0,
      failures: 0
    };

    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.updateCount = this.updateCount.bind(this);
    this.updateSymbolCode = this.updateSymbolCode.bind(this);
    this.executePerformanceTest = this.executePerformanceTest.bind(this);
    this.resetPerformanceTest = this.resetPerformanceTest.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value});
  }

  updateCount(event) {
    let newCount = event.target.value;
    this.setState({count: newCount});
  }

  updateSymbolCode(event) {
    let symbolCode = event.target.value;
    this.setState({symbolCode: symbolCode});
  }

  createRandomFeature() {
    let feature,
      args = {};

    args.geoId = "feature " + this.state.featureNumber;
    args.name = "feature " + this.state.featureNumber;
    args.symbolCode = this.state.symbolCode;
    args.positions = createRandomPositions(3);

    feature = new emp3.api.MilStdSymbol(args);

    this.setState({
      featureNumber: this.state.featureNumber + 1
    });
    return feature;
  }

  executePerformanceTest() {

    let map = _.find(this.props.maps, {geoId: this.state.selectedMapId});

    if (map) {
      this.setState({running: true});
      map.addOverlay({
        overlay: this.state.overlay,
        onSuccess: (args) => {


          let features = [];
          let feature;
          let startTime = Date.now();
          let endTime;

          for (let i = 0, len = this.state.count; i < len; i++) {
            feature = this.createRandomFeature();
            features.push(feature);
          }

          endTime = Date.now() - startTime;
          this.setState({createTime: endTime});

          startTime = Date.now();
          args.overlays[0].addFeatures({

            features: features,
            onSuccess: (args) => {
              endTime = Date.now() - startTime;
              this.setState({loadTime: endTime});
              this.setState({running: false});
              this.setState({numberAdded: args.features.length});
              this.setState({failures: args.failures.length});
            }
          });
        }
      });
    } else {
      toastr.error("No map selected");
    }

  }

  resetPerformanceTest() {
    let map = _.find(this.props.maps, {geoId: this.state.selectedMapId});

    if (map) {
      map.removeOverlay({
        overlay: this.state.overlay
      });
    } else {
      toastr.error("No map selected");
    }
  }

  render() {
    const {maps} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Multipoint Performance Test</span>

        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect maps={maps}
                     selectedMapId={this.state.selectedMapId}
                     callback={this.updateSelectedMap}
                     label="Choose the map"/>
        </div>

        <VText id='multipointPerformance-symbolCode'
               classes={['mdl-cell', 'mdl-cell--12-col']}
               value={this.state.symbolCode}
               callback={this.updateSymbolCode}
               label='Symbol Code'/>

        <VText id='multipointPerformance-count'
               classes={['mdl-cell', 'mdl-cell--12-col']}
               value={this.state.count}
               callback={this.updateCount}
               label='Number of multipoints to draw'/>

         <button id='multipointPerformance-execute'
           className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect mdl-cell mdl-cell--12-col'
           onClick={this.executePerformanceTest} disabled={this.state.running}>
           Go
         </button>

         <div>{this.state.numberAdded} graphics added</div>
         <div>{this.state.failures} failures</div>
         <div>Build Time: {this.state.createTime} ms</div>
         <div>Add Time: {this.state.loadTime} ms</div>

         <button id='multipointPerformance-reset'
           className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect mdl-cell mdl-cell--12-col'
           onClick={this.resetPerformanceTest}>
           Reset
         </button>
      </div>
    );
  }
}

MultipointPerformanceTest.propTypes = {
  maps: PropTypes.array
};

export default MultipointPerformanceTest;
