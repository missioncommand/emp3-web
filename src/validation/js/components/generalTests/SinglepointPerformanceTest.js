import React, {Component, PropTypes} from 'react';
import {VText} from '../shared';

class SinglepointPerformanceTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      symbolCode: 'SFGPUCI----K---',
      symbolCount: 1000,
      running: false,
      time: {
        start: undefined,
        end: undefined,
        duration: 0
      }
    };

    this.tick = this.tick.bind(this);
    this.tock = this.tock.bind(this);

    this.handleSymbolCodeUpdate = this.handleSymbolCodeUpdate.bind(this);

    this.run = this.run.bind(this);
  }

  handleSymbolCodeUpdate(event) {
    if (event.target.value.length <= 15) {
      this.setState({symbolCode: event.target.value});
    }
  }

  tick() {
    let time = {...this.state.time};
    time.start = new Date();
    time.end = undefined;
    time.duration = 0;
    this.setState({time: time, running: true});
  }

  tock() {
    let time = {...this.state.time};
    time.end = new Date;
    time.duration = time.end - time.start;
    this.setState({time: time, running: false});
  }

  run() {
    const {addOverlay, maps} = this.props;
    const map = _.first(maps);
    let that = this;

    new Promise((resolve) => {
      map.getAllOverlays({
        onSuccess: (cbArgs) => {
          if (cbArgs.overlays.length > 0) {
            resolve(new Promise((resolve) => {
              cbArgs.overlays[0].clearContainer({
                onSuccess: () => {
                  resolve(cbArgs.overlays[0]);
                }
              });
            }));
          } else {
            resolve(new Promise(() => {
              let overlay = new emp3.api.Overlay({name: map.container + '_performanceTestOverlay'});
              addOverlay(overlay);
              map.addOverlay({
                overlay: overlay,
                onSuccess: resolve(overlay)
              });
            }));
          }
        }
      });
    }).then(overlay => {
      let count = Math.abs(parseInt(this.state.symbolCount)),
        features = [],
        i, lat, lon, step;

      lat = 37;
      lon = -100;
      step = .2;

      for (i = 0; i < count; i++) {

        features.push(new emp3.api.MilStdSymbol({
          symbolCode: this.state.symbolCode,
          position: {
            latitude: lat,
            longitude: lon
          }
        }));

        if (lat <= -75) {
          lat = 75;
        } else if (lon > -50) {
          lat -= step;
          lon = -100;
        } else {
          lon += step;
        }
      }

      that.tick();
      overlay.addFeatures({
        features: features,
        onSuccess: that.tock,
        onError: () => {
          toastr.error('Failed Rendering Points');
          that.tock();
        }
      });
    });
  }


  render() {
    return (
      <div>
        <span className="mdl-layout-title">Singlepoint Performance Test</span>
        <div className="mdl-grid">
          <VText className="mdl-cell mdl-cell--8-col"
                 value={this.state.symbolCode}
                 id="symbolCode"
                 label="Symbol Code"
                 callback={this.handleSymbolCodeUpdate}/>

          <VText className="mdl-cell mdl-cell--3-col"
                 value={this.state.symbolCount}
                 id="symbolCount"
                 label="Symbol Count"
                 callback={(event) => this.setState({symbolCount: event.target.value})}/>

          <button className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-cell mdl-cell--12-col"
                  disabled={this.state.running}
                  onClick={this.run}>
            Start
          </button>

          <div className="mdl-cell mdl-cell--12-col mdl-grid">
            <VText className="mdl-cell mdl-cell--12-col"
                   id="timer-duration"
                   label="Duration"
                   value={this.state.time.duration}/>
          </div>
        </div>
      </div>
    );
  }
}

SinglepointPerformanceTest.propTypes = {
  maps: PropTypes.array.isRequired,
  overlays: PropTypes.array.isRequired,
  addOverlay: PropTypes.func
};

export default SinglepointPerformanceTest;
