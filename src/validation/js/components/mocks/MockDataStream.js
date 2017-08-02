import * as React from 'react';
import {Component, PropTypes} from 'react';

/**
 * This attempts to apply updates to any feature that is not a multi-point milstd feature on a timer. This currently
 * only runs while the test is open. This is on purpose until the stream mechanism can be built into the main
 * application.
 */
class MockDataStream extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataStreamInterval: false,
      dataStreamIntervalTime: 500,
      updateAmount: 75
    };

    this.updateInterval = this.updateInterval.bind(this);
    this.toggleStream = this.toggleStream.bind(this);
    this._runDataStream = this._runDataStream.bind(this);
  }

  _runDataStream() {
    const {features} = this.props;
    const _pickRandomElement = (array) => {
      let index = Math.floor(Math.random() * (array.length - 1));
      return array[index];
    };

    const _randomNegative = () => {
      return (Math.random() > 0.5 ? -1 : 1);
    };

    features.forEach(feature => {
      // Update a percentage of features
      if (Math.random() * 100 < (100 - this.state.updateAmount)) {
        return;
      }

      // Ignore multi-point milstd features
      if (feature.featureType === "milstd") {
        let standard = feature.symbolStandard || '2525c',
          basicSymbol = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(feature.symbolCode, standard),
          symbolDef = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicSymbol, standard === '2525b' ? 0 : 1);

        if (symbolDef && symbolDef.maxPoints > 1) {
          return;
        }
      }

      let position = _pickRandomElement(feature.positions);

      let changeLat = Math.random() > 0.5;

      if (changeLat) {
        position.latitude += 0.01 * _randomNegative();
      } else {
        position.longitude += 0.01 * _randomNegative();
      }

      feature.update();
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.dataStreamInterval);
  }

  updateInterval(e) {
    let dataStreamIntervalTime = parseInt(e.target.value);

    // Update the time
    this.setState({dataStreamIntervalTime: dataStreamIntervalTime}, () => {
      // If the stream was running restart it with the new time
      if (this.state.dataStreamInterval) {
        this.toggleStream(true);
      }
    });
  }

  toggleStream(restart) {
    restart = restart || false;
    let dataStreamInterval = this.state.dataStreamInterval;

    if (dataStreamInterval) {
      clearInterval(dataStreamInterval);
      dataStreamInterval = false;
    } else {
      dataStreamInterval = setInterval(this._runDataStream, this.state.dataStreamIntervalTime);
    }

    if (restart) {
      this.setState({dataStreamInterval: dataStreamInterval}, this.toggleStream);
    } else {
      this.setState({dataStreamInterval: dataStreamInterval});
    }
  }

  render() {
    return (
      <div className="mdl-grid">
        <span className="mdl-layout-title">Mock Data Stream</span>

        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-cell mdl-cell--12-col"
                onClick={() => this.toggleStream()}>
          {this.state.dataStreamInterval ? "Stop Stream" : "Start Stream"}
        </button>

        <div className="mdl-cell mdl-cell--12-col">
          <p style={{width: "100%"}}>
            <label htmlFor="dataStreamIntervalTime">Message
              Interval: {this.state.dataStreamIntervalTime}ms</label>
            <input className="mdl-slider mdl-js-slider"
                   type="range"
                   id="dataStreamIntervalTime"
                   min={1}
                   max={5000}
                   value={this.state.dataStreamIntervalTime}
                   onChange={this.updateInterval}/>
          </p>
        </div>

        <div className="mdl-cell mdl-cell--12-col">
          <p style={{width: "100%"}}>
            <label htmlFor="updatePercentage">Update Percent of Features: {this.state.updateAmount}%</label>
            <input className="mdl-slider mdl-js-slider"
                   type="range"
                   id="updatePercentage"
                   min={10}
                   step={5}
                   max={100}
                   value={this.state.updateAmount}
                   onChange={e => this.setState({updateAmount: parseInt(e.target.value)})}/>
          </p>
        </div>

      </div>
    );
  }
}

MockDataStream.propTypes = {
  features: PropTypes.array
};

export default MockDataStream;