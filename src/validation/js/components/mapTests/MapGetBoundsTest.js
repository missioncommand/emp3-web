import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect, VText} from '../shared';

class MapGetBoundsTest extends Component {
  constructor(props) {
    super(props);

    var selectedMapId = '';
    let currentBounds = {
      north: '',
      south: '',
      east: '',
      west: ''
    };

    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      currentBounds: currentBounds
    };

    this.getBounds = this.getBounds.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  getBounds() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});


    try {
      var bounds = map.getBounds();
      this.setState({
        currentBounds: bounds
      });
      toastr.success("The Bounds are " + map.getBounds());
    } catch (err) {
      toastr.error(err.message, 'Map.getBounds: Critical');
    }
  }

  render() {
    const {maps} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Get a Map's Bounds</span>
        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <MapSelect
              maps={maps}
              selectedMapId={this.state.selectedMapId}
              label='Select Map '
              callback={event => this.setState({selectedMapId: event.target.value})}/>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            disabled={this.state.selectedMapId === ''}
            onClick={this.getBounds}>
            Get Bounds
          </button>

          <div className='mdl-cell mdl-cell--12-col mdl-grid'>
            <VText id='currentBounds-north'
                   value={this.state.currentBounds.north}
                   label='North'
                   classes={['mdl-cell', 'mdl-cell--6-col']}/>
            <VText id='currentBounds-south'
                   value={this.state.currentBounds.south}
                   label='South'
                   classes={['mdl-cell', 'mdl-cell--6-col']}/>
          </div>

          <div className='mdl-cell mdl-cell--12-col mdl-grid'>
            <VText id='currentBounds-east'
                   value={this.state.currentBounds.east}
                   label='East'
                   classes={['mdl-cell', 'mdl-cell--6-col']}/>
            <VText id='currentBounds-west'
                   value={this.state.currentBounds.west}
                   label='West'
                   classes={['mdl-cell', 'mdl-cell--6-col']}/>
          </div>

          <div className='mdl-cell mdl-cell--12-col'>
            <RelatedTests relatedTests={[
              {text: 'Get Map Camera', target: 'mapGetCameraTest'},
              {text: 'Get Map LookAt', target: 'mapGetLookAtTest'},
              {text: 'Set Bounds', target: 'mapSetBoundsTest'},
              {text: 'Set Map Camera', target: 'mapSetCameraTest'},
              {text: 'Set Map LookAt', target: 'mapSetLookAtTest'}
            ]}/>
          </div>
        </div>
      </div>
    );
  }
}

MapGetBoundsTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapGetBoundsTest;
