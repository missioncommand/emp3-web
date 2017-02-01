import * as React from 'react';
import {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {VText} from '../shared';

class MapSetBoundsTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    let currentBounds = {
      north: '',
      south: '',
      east: '',
      west: ''
    };
    if (props.maps.length > 0) {
      let map = _.first(props.maps);
      selectedMapId = map.geoId;
      currentBounds = map.bounds;
    }

    this.state = {
      selectedMapId: selectedMapId,
      bounds: {
        north: '',
        south: '',
        east: '',
        west: ''
      },
      animate: true,
      currentBounds: currentBounds
    };

  this.mapSetBounds = this.mapSetBounds.bind(this);
  this.updateSelectedMap = this.updateSelectedMap.bind(this);
  this.updateBounds = this.updateBounds.bind(this);
  this.toggleAnimate = this.toggleAnimate.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      let map = _.first(props.maps);
      this.setState({
        selectedMapId: map.geoId,
        currentBounds: map.bounds
      });
    }
  }

  updateBounds(event) {
    const prop = event.target.id.split('-')[1];
    let newBounds = {...this.state.bounds};
    newBounds[prop] = event.target.value;
    this.setState({bounds: newBounds});
  }

  toggleAnimate(event) {
    setTimeout(this.setState({animate: event.target.checked}), 50);
  }

  mapSetBounds() {
    if (this.state.selectedMapId === '') {
      toastr.warning('Please select a map first');
      return;
    }

    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});

    try {
      map.setBounds({
        north: this.state.bounds.north === '' ? undefined : parseFloat(this.state.bounds.north),
        south: this.state.bounds.south === '' ? undefined : parseFloat(this.state.bounds.south),
        east: this.state.bounds.east === '' ? undefined : parseFloat(this.state.bounds.east),
        west: this.state.bounds.west === '' ? undefined : parseFloat(this.state.bounds.west),
        animate: this.state.animate,
        onSuccess: (cbArgs) => {
          toastr.success('Bounds Set Successfully');
          this.props.addResult(cbArgs, 'map.setBounds');
          setTimeout(() => {
            this.setState({currentBounds: map.bounds});
            let boundsString = 'North: ' + map.bounds.north.toFixed(2) + '<br/>';
            boundsString += 'South: ' + map.bounds.south.toFixed(2) + '<br/>';
            boundsString += 'East: ' + map.bounds.east.toFixed(2) + '<br/>';
            boundsString += 'West: ' + map.bounds.west.toFixed(2) + '<br/>';
            toastr.info(boundsString, 'Map Bounds Updated');
          }, 1000); // TODO the bounds on the map is updated by a second event
        },
        onError: err => {
          this.props.addError(err, 'mapSetBounds');
          toastr.error('Failed to Set Bounds');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Set Bounds Failed: Critical');
      this.props.addError(err.message, 'mapSetBounds: Critical');
    }
  }

  updateSelectedMap(event) {
   let map = _.find(this.props.maps, {geoId:event.target.value});
    this.setState({
      selectedMapId: map.geoId,
      currentBounds: map.bounds
    });
  }

  render() {
    return (
      <div>
        <span className='mdl-layout-title'>Set a Map's Bounds</span>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--3-col'>
            <VText id='bounds-north' value={this.state.bounds.north} label='North' callback={this.updateBounds}/>
          </div>
          <div className='mdl-cell mdl-cell--3-col'>
            <VText id='bounds-south' value={this.state.bounds.south} label='South' callback={this.updateBounds}/>
          </div>
          <div className='mdl-cell mdl-cell--3-col'>
            <VText id='bounds-east' value={this.state.bounds.east} label='East' callback={this.updateBounds}/>
          </div>
          <div className='mdl-cell mdl-cell--3-col'>
            <VText id='bounds-west' value={this.state.bounds.west} label='West' callback={this.updateBounds}/>
          </div>
        </div>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--3-col mdl-cell--1-offset'>
            <label className="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" htmlFor="animate">
              <input type="checkbox" id="animate" className="mdl-checkbox__input" onChange={this.toggleAnimate} checked={this.state.animate}/>
              <span className="mdl-checkbox__label">Animate</span>
            </label>
          </div>
        </div>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <label htmlFor='mapSelect'>Select map</label>
            <select className='blocky' id='mapSelect' value={this.state.selectedMapId} onChange={this.updateSelectedMap}>
              {this.props.maps.map(map => {
                return <option key={map.geoId} value={map.geoId}>{map.container}</option>;
              })}
            </select>

            <button className='blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                    onClick={this.mapSetBounds} disabled={this.props.maps.length === 0}>
              Set Bounds
            </button>
          </div>
        </div>

        <hr/>
        <h3>Current Bounds</h3>
        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--6-col'>
            <VText id='currentBounds-north' value={this.state.currentBounds.north} label='North'/>
          </div>
          <div className='mdl-cell mdl-cell--6-col'>
            <VText id='currentBounds-south' value={this.state.currentBounds.south} label='South'/>
          </div>
        </div>
        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--6-col'>
            <VText id='currentBounds-east' value={this.state.currentBounds.east} label='East'/>
          </div>
          <div className='mdl-cell mdl-cell--6-col'>
            <VText id='currentBounds-west' value={this.state.currentBounds.west} label='West'/>
          </div>
        </div>

        <RelatedTests relatedTests={[
          {text: 'Get Bounds', target: 'mapGetBoundsTest'},
          {text: 'Get Map Camera', target: 'mapGetCameraTest'},
          {text: 'Get Map LookAt', target: 'mapGetLookAtTest'},
          {text: 'Set Map Camera', target: 'mapSetCameraTest'},
          {text: 'Set Map LookAt', target: 'mapSetLookAtTest'}
          ]}/>
      </div>
    );
  }
}

MapSetBoundsTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  maps: PropTypes.array.isRequired
};

export default MapSetBoundsTest;
