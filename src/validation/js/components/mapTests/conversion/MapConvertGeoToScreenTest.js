import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {MapSelect, VText} from '../../shared';
import {RelatedTests} from '../../../containers';
import {toggleInstructions} from '../../../actions/InstructionsStateActions';

class MapConvertGeoToScreenTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }
    this.state = {
      selectedMapId: selectedMapId,
      holdGeo: false,
      pixel: {
        x: 0,
        y: 0
      },
      geo: {
        latitude: 0,
        longitude: 0
      },
      calculated: {
        x: 0,
        y: 0
      }
    };

    this.eventListeners = [];

    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.updateGeo = this.updateGeo.bind(this);
    this.updatePixel = this.updatePixel.bind(this);
    this.convertGeo = this.convertGeo.bind(this);
    this.setEventListener = this.setEventListener.bind(this);
    this.clearEventListeners = this.clearEventListeners.bind(this);
  }

  componentDidMount() {
    const {maps} = this.props;

    maps.map(map => this.setEventListener(map));
    window.addEventListener('mousemove', this.updatePixel);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.updatePixel);
    this.clearEventListeners();
  }

  /**
   * @param {emp3.api.Map} map
   */
  setEventListener(map) {
    let mouseMoveListener = args => {
      let geo = {
        latitude: args.latitude,
        longitude: args.longitude
      };
      if (map.geoId === this.state.selectedMapId && !this.state.holdGeo) {
        this.setState({geo: geo});
      }
    };

    let mouseClickListener = args => {
      if (args.event !== emp3.api.enums.UserInteractionEventEnum.CLICKED) {
        return;
      }
      if (args.target.geoId === this.state.selectedMapId) {
        this.setState({holdGeo: !this.state.holdGeo});
      } else {
        this.setState({holdGeo: false});
      }
    };

    map.addEventListener({
      eventType: emp3.api.enums.EventType.MAP_CURSOR_MOVE,
      callback: mouseMoveListener
    });

    map.addEventListener({
      eventType: emp3.api.enums.EventType.MAP_INTERACTION,
      callback: mouseClickListener
    });

    this.eventListeners.push({
      map: map, callbacks: [
        {type: emp3.api.enums.EventType.MAP_CURSOR_MOVE, callback: mouseMoveListener},
        {type: emp3.api.enums.EventType.MAP_INTERACTION, callback: mouseClickListener}
      ]
    });
  }

  clearEventListeners() {
    _.forEach(this.eventListeners, entry => {
      _.forEach(entry.callbacks, callback => {
        entry.map.removeEventListener({
          eventType: callback.type,
          callback: callback.callback
        });
      });

    });
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId, holdGeo: false});
    }
    this.clearEventListeners();
    props.maps.map(map => this.setEventListener(map));
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value, holdGeo: false});
  }

  updatePixel(event) {
    if (this.state.holdGeo) {
      return;
    }
    let pixel = {
      x: event.clientX,
      y: event.clientY
    };
    this.setState({pixel:pixel});
  }

  updateGeo(event) {
    let geo = {...this.state.geo};
    switch (event.target.id) {
      case 'latitude':
        geo.latitude = event.target.value;
        break;
      case 'longitude':
        geo.longitude = event.target.value;
        break;
    }
    this.setState({geo: geo});
  }

  convertGeo() {
    if (this.state.selectedMapId === '') {
      return;
    }

    const {maps} = this.props;
    const map = _.find(maps, {geoId: this.state.selectedMapId});
    try {
      let calculated = map.geoToScreen({
        latitude: parseFloat(this.state.geo.latitude),
        longitude: parseFloat(this.state.geo.longitude)
      });
      this.setState({calculated: calculated});
    } catch (err) {
      toastr.error(err.message, 'map.geoToContainer: Critical');
    }
  }

  render() {
    const {maps, instructionsStates, toggleInstructions} = this.props;
    let hideInstructions = instructionsStates[this.constructor.name];

    const frozenStyle = {backgroundColor: this.state.holdGeo ? 'rgba(0, 0, 255, 0.25)' : null};

    const instructions = (
      <div
        className='mdl-cell mdl-cell--12-col mdl-card mdl-shadow--2dp mdl-color--blue-grey-200 mdl-color-text--blue-grey-700'>
        <div className='mdl-card__title'>
          <h4 className='mdl-card__title-text'>Instructions</h4>
        </div>

        <div className='mdl-card__supporting-text'>
          Move the cursor on the map
          <br/>
          Click to freeze geo position
          <br/>
          Click again to un-freeze
          <hr/>
          <span style={{textAlign: 'center'}}>or</span>
          <hr/>
          Enter the desired geo values manually.
        </div>

        <div className='mdl-card__actions'>
          <button
            onClick={() => toggleInstructions(this.constructor.name)}
            className='mdl-button mdl-js-button mdl-js-ripple-effect'>
            Hide
          </button>
        </div>
      </div>
    );

    return (
      <div>
        <span
          className='mdl-layout-title'
          onClick={() => toggleInstructions(this.constructor.name)}>
          Map.geoToScreen
        </span>

        <div className='mdl-grid'>
          {hideInstructions ? null : instructions}

          <div className='mdl-cell mdl-cell--12-col'>
            <MapSelect
              maps={maps}
              selectedMapId={this.state.selectedMapId}
              callback={this.updateSelectedMap}
              label='Monitor map '/>
          </div>

          <div className='mdl-cell mdl-cell--12-col mdl-grid' style={frozenStyle}>
            <VText id='latitude'
                   label='Latitude'
                   classes={['mdl-cell', 'mdl-cell--6-col']}
                   callback={this.updateGeo}
                   value={this.state.geo.latitude}/>

            <VText id='longitude'
                   label='Longitude'
                   classes={['mdl-cell', 'mdl-cell--6-col']}
                   callback={this.updateGeo}
                   value={this.state.geo.longitude}/>
          </div>

          <div className='mdl-cell mdl-cell--12-col mdl-grid'>
            <VText id='pixelX'
                   label='Pixel-X'
                   classes={['mdl-cell', 'mdl-cell--6-col']}
                   value={this.state.pixel.x}/>

            <VText id='pixelY'
                   label='Pixel-Y'
                   classes={['mdl-cell', 'mdl-cell--6-col']}
                   value={this.state.pixel.y}/>
          </div>
          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            disabled={this.state.selectedMapId === ''}
            onClick={this.convertGeo}>
            Convert Lat/Lon to Pixel
          </button>

          <div className='mdl-cell mdl-cell--12-col mdl-grid'>
            <VText id='convertedX'
                   label='Calculated X'
                   classes={['mdl-cell', 'mdl-cell--6-col']}
                   value={this.state.calculated.x}/>

            <VText id='convertedY'
                   label='Calculated Y'
                   classes={['mdl-cell', 'mdl-cell--6-col']}
                   value={this.state.calculated.y}/>
          </div>

          <div className='mdl-cell mdl-cell--12-col'>
            <RelatedTests relatedTests={[
              {text: 'Map.ScreenToGeo', target: 'mapConvertScreenToGeoTest'},
              {text: 'Map.geoToContainer', target: 'mapConvertGeoToContainerTest'},
              {text: 'Map.containerToGeo', target: 'mapConvertContainerToGeoTest'}
            ]}/>
          </div>
        </div>
      </div>
    );
  }
}

MapConvertGeoToScreenTest.propTypes = {
  maps: PropTypes.array,
  instructionsStates: PropTypes.object,
  toggleInstructions: PropTypes.func
};

const mapStateToProps = state => {
  return {
    maps: state.maps,
    instructionsStates: state.instructionsStates
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleInstructions: (id) => {
      dispatch(toggleInstructions(id));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapConvertGeoToScreenTest);
