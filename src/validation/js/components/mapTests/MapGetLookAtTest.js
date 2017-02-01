import React, {Component, PropTypes} from 'react';
import {MapSelect, VText} from '../shared';
import {RelatedTests} from '../../containers';

class MapGetLookAtTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      lookAt: {}
    };

    this.getLookAt = this.getLookAt.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  getLookAt() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    const lookAt = map.getLookAt();
    if (lookAt) {
      this.setState({lookAt: lookAt});
    } else {
      toastr.error('LookAt returned undefined');
    }
  }

  render() {
    return (
      <div className='mdl-grid'>
        <span className='mdl-layout-title'>Get LookAt</span>
        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect selectedMapId={this.state.selectedMapId} maps={this.props.maps}
                     callback={event => this.setState({selectedMapId: event.target.value})}/>

          <button className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                  onClick={this.getLookAt} disabled={this.state.selectedMapId === ''}>
            Get LookAt
          </button>

          <VText id='lookAt-name' label='Name' value={this.state.lookAt.name}/>
          <VText id='lookAt-geoId' label='GeoId' value={this.state.lookAt.geoId}/>

          <div className='mdl-grid'>
            <div className='mdl-cell mdl-cell--4-col'>
              <VText id='lookAt-latitude' label='Latitude' value={this.state.lookAt.latitude}/>
            </div>
            <div className='mdl-cell mdl-cell--4-col'>
              <VText id='lookAt-longitude' label='Longitude' value={this.state.lookAt.longitude}/>
            </div>
            <div className='mdl-cell mdl-cell--4-col'>
              <VText id='lookAt-altitude' label='Altitude' value={this.state.lookAt.altitude}/>
            </div>
          </div>

          <div className='mdl-grid'>
            <div className='mdl-cell mdl-cell--4-col'>
              <VText id='lookAt-range' label='Range' value={this.state.lookAt.range}/>
            </div>
            <div className='mdl-cell mdl-cell--4-col'>
              <VText id='lookAt-tilt' label='Tilt' value={this.state.lookAt.tilt}/>
            </div>
            <div className='mdl-cell mdl-cell--4-col'>
              <VText id='lookAt-heading' label='Heading' value={this.state.lookAt.heading}/>
            </div>
          </div>

          <RelatedTests relatedTests={[
            {text: 'Get Bounds', target: 'mapGetBoundsTest'},
            {text: 'Get Map Camera', target: 'mapGetCameraTest'},
            {text: 'Set Bounds', target: 'mapSetBoundsTest'},
            {text: 'Set Map Camera', target: 'mapSetCameraTest'},
            {text: 'Set Map LookAt', target: 'mapSetLookAtTest'}
          ]}/>
        </div>
      </div>
    );
  }
}


MapGetLookAtTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapGetLookAtTest;
