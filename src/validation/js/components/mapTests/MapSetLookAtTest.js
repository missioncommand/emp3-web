import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect, VText, VCheckBox} from '../shared';

class MapSetLookAtTest extends Component {
  constructor(props) {
    super(props);

    var selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }
    this.state = {
      selectedMapId: selectedMapId,
      lookAt: {
        name: '',
        geoId: '',
        description: '',
        latitude: '',
        longitude: '',
        altitude: '',
        range: '',
        tilt: '',
        heading: '',
        altitudeMode: ''
      },
      animate: false
    };

    this.setLookAt = this.setLookAt.bind(this);
    this.updateLookAt = this.updateLookAt.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  updateLookAt(event) {
    let prop = event.target.id.split('-')[1];
    let lookAt = {...this.state.lookAt};

    switch (prop) {
      case 'animate':
        this.setState({animate: event.target.checked});
        break;
      default:
        lookAt[prop] = event.target.value;
        this.setState({lookAt: lookAt});
    }
  }

  setLookAt() {
    const {maps, addLookAt, addError} = this.props;
    const map = _.find(maps, {geoId: this.state.selectedMapId});

    try {
      const lookAt = new emp3.api.LookAt({
        name: this.state.lookAt.name === '' ? undefined : this.state.lookAt.name,
        geoId: this.state.lookAt.geoId === '' ? undefined : this.state.lookAt.geoId,
        description: this.state.lookAt.description === '' ? undefined : this.state.lookAt.description,
        latitude: this.state.lookAt.latitude === '' ? undefined : parseFloat(this.state.lookAt.latitude),
        longitude: this.state.lookAt.longitude === '' ? undefined : parseFloat(this.state.lookAt.longitude),
        altitude: this.state.lookAt.altitude === '' ? undefined : parseFloat(this.state.lookAt.altitude),
        range: this.state.lookAt.range === '' ? undefined : parseFloat(this.state.lookAt.range),
        heading: this.state.lookAt.heading === '' ? undefined : parseFloat(this.state.lookAt.heading),
        tilt: this.state.lookAt.tilt === '' ? undefined : parseFloat(this.state.lookAt.tilt)
      });

      map.setLookAt({
        animate: this.state.animate,
        lookAt: lookAt,
        onSuccess: () => {
          toastr.success('LookAt Set Successfully');
          addLookAt(lookAt);
        },
        onError: err => {
          addError(err, 'Map.setLookAt');
          toastr.error('Failed to Set LookAt');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Map.setLookAt: Critical');
    }
  }

  render() {
    return (
      <div>
        <span className='mdl-layout-title'>Set LookAt</span>
        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <MapSelect selectedMapId={this.state.selectedMapId} label='Select Map ' maps={this.props.maps}
                       callback={event => this.setState({selectedMapId: event.target.value})}/>

          </div>

          <button
            className='mdl-button mdl-js-button mdl-js--ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.setLookAt} disabled={this.state.selectedMapId === ''}>
            Set Look At
          </button>

          <VText id='lookAt-name'
                 value={this.state.lookAt.name}
                 label='Name'
                 callback={this.updateLookAt}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='lookAt-geoId'
                 value={this.state.lookAt.geoId}
                 label='GeoId'
                 callback={this.updateLookAt}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
            <VText id='lookAt-latitude'
                   classes={['mdl-cell', 'mdl-cell--4-col']}
                   value={this.state.lookAt.latitude}
                   label='Latitude'
                   callback={this.updateLookAt}/>

            <VText id='lookAt-longitude'
                   classes={['mdl-cell', 'mdl-cell--4-col']}
                   value={this.state.lookAt.longitude}
                   label='Longitude'
                   callback={this.updateLookAt}/>

            <VText id='lookAt-altitude'
                   classes={['mdl-cell', 'mdl-cell--4-col']}
                   value={this.state.lookAt.altitude}
                   label='Altitude'
                   callback={this.updateLookAt}/>
          </div>

          <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
            <VText id='lookAt-range'
                   classes={['mdl-cell', 'mdl-cell--4-col']}
                   value={this.state.lookAt.range}
                   label='Range'
                   callback={this.updateLookAt}/>

            <VText id='lookAt-tilt'
                   classes={['mdl-cell', 'mdl-cell--4-col']}
                   value={this.state.lookAt.tilt}
                   label='Tilt'
                   callback={this.updateLookAt}/>

            <VText id='lookAt-heading'
                   classes={['mdl-cell', 'mdl-cell--4-col']}
                   value={this.state.lookAt.heading}
                   label='Heading'
                   callback={this.updateLookAt}/>
          </div>

          <div className='mdl-cell mdl-cell--12-col'>
            <label htmlFor='lookAt-altitudeMode'>Altitude Mode </label>
            <select id='lookAt-altitudeMode' value={this.state.lookAt.altitudeMode} onChange={this.updateLookAt}>
              {_.map(cmapi.enums.altitudeMode, mode => {
                return <option key={mode} value={mode}>{mode}</option>;
              })}
            </select>
          </div>

          <div className='mdl-cell mdl-cell--6-col'>
            <VCheckBox id="lookAt-animate" label="Animate" checked={this.state.animate} callback={this.updateLookAt}
                       disabled={true}/>
          </div>

          <RelatedTests relatedTests={[
            {text: 'Get Bounds', target: 'mapGetBoundsTest'},
            {text: 'Get Map Camera', target: 'mapGetCameraTest'},
            {text: 'Get Map LookAt', target: 'mapGetLookAtTest'},
            {text: 'Set Bounds', target: 'mapSetBoundsTest'},
            {text: 'Set Map Camera', target: 'mapSetCameraTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapSetLookAtTest.propTypes = {
  maps: PropTypes.array.isRequired,
  lookAts: PropTypes.array.isRequired,
  addError: PropTypes.func.isRequired,
  addLookAt: PropTypes.func.isRequired
};

export default MapSetLookAtTest;
