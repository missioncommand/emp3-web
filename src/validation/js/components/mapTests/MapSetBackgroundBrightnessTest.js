import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect, VText} from '../shared';

class MapSetBackgroundBrightnessTest extends Component {
  constructor(props) {
    super(props);

    var selectedMapId = '';

    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      brightness: 50
    };

    this.setBackgroundBrightness = this.setBackgroundBrightness.bind(this);
    this.update = this.update.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  update(event) {
    this.setState({brightness: event.target.value});
  }

  setBackgroundBrightness() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    try {

      map.setBackgroundBrightness(parseInt(this.state.brightness));
      toastr.success("Changed Background Brightness to " + this.state.brightness);

    } catch(err) {
      toastr.error(err.message, 'Map.setBackgroundBrightness: Critical');
    }
  }

  render() {
    return (
      <div className='mdl-grid'>
        <span className='mdl-layout-title'>Set BackgroundBrightness</span>
        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect selectedMapId={this.state.selectedMapId} label='Select Map ' maps={this.props.maps}
                     callback={event => this.setState({selectedMapId: event.target.value})}/>

          <VText id='mapSetBackgroundBrightness-brightness' value={this.state.brightness} label='Brightness' callback={this.update}/>
          <br/>
          <br/>
          <button className='mdl-button mdl-js-button mdl-js--ripple-effect mdl-button--raised mdl-button--colored'
                  onClick={this.setBackgroundBrightness} disabled={this.state.selectedMapId === ''}>
            Set
          </button>

          <RelatedTests relatedTests={[
            {text: 'Map.getBackgroundBrightness', target: 'mapGetBackgroundBrightnessTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapSetBackgroundBrightnessTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapSetBackgroundBrightnessTest;
