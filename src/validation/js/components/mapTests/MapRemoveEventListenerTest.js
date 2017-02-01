import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect, VSelect} from '../shared';

class MapRemoveEventListenerTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }
    this.state = {
      selectedMapId: selectedMapId,
      selectedEvent: emp3.api.enums.EventType.CAMERA_EVENT,
      eventResultTextArea: '',
      callback: '',
      callbackIndex: 0,
      callbacks: []
    };
    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.updateSelectedEvent = this.updateSelectedEvent.bind(this);
    this.updateSelectedCallback = this.updateSelectedCallback.bind(this);
    this.removeEventListener = this.removeEventListener.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value});
  }

  updateSelectedEvent(event) {
    this.setState({
      selectedEvent: emp3.api.enums.EventType[event.target.value],
      callbacks: this.props.eventListeners[emp3.api.enums.EventType[event.target.value]] ? this.props.eventListeners[emp3.api.enums.EventType[event.target.value]].callbacks : []
    }, () => {

      if (this.state.callbacks.length > 0) {
        this.setState({
          callbackIndex: 0,
          callback: this.state.callbacks[0]
        });
      }
    });
  }

  updateSelectedCallback(event) {

    this.setState({
      callbackIndex: event.target.value,
      callback: this.state.callbacks[event.target.value]
    });

  }

  removeEventListener() {

    if (this.state.selectedMapId === '') {
      toastr.warning('Please select a map first');
      return;
    }

    const {maps} = this.props;

    const map = _.find(maps, {geoId: this.state.selectedMapId});
    const args = {
      eventType: this.state.selectedEvent,
      callback: this.state.callback
    };


    try {
      map.removeEventListener(args);
      toastr.success('Map removeEventListenerCallback Success');
    } catch (err) {
      toastr.error(err.message, 'Map removeEventListenerCallback Failed');
    }
  }

  render() {
    const {maps} = this.props;
    let x = 0;

    return (
      <div>
        <span className='mdl-layout-title'>Unsubscribe from a Map's Events</span>
        <div className='mdl-grid'>
          <div>
            <MapSelect
              maps={maps}
              selectedMapId={this.state.selectedMapId}
              callback={this.updateSelectedMap}
              label="Select which map's events you'd like to listen to."/>
          </div>
        </div>
        <div className='mdl-cell mdl-cell--12-col'>
          <VSelect
            id='mapRemoveEventListener-event'
            callback={this.updateSelectedEvent}
            values={emp3.api.enums.EventType}
            label="Select which event you'd like to remove"/>
        </div>

        <div className='mdl-cell mdl-cell--12-col'>
          <label htmlFor='callbackSelect'>Callbacks</label>
          <select id='callbackSelect' value={this.state.callbackIndex} onChange={this.updateSelectedCallback}>
            {this.state.callbacks.map(() => {
              let option = <option key={x} value={x}>{x}</option>;
              x++;
              return option;
            })}
          </select>
        </div>

        <button
          className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col"
          disabled={this.state.selectedMapId === ''}
          onClick={this.removeEventListener}>
          Unsubscribe
        </button>

        <div className='mdl-cell mdl-cell--12-col'>
          <RelatedTests relatedTests={[
            {text: 'Subscribe to a map event', target: 'mapAddEventListenerTest'},
            {text: 'Subscribe to an overlay event', target: 'overlayAddEventListenerTest'},
            {text: 'Subscribe to a feature event', target: 'featureAddEventListenerTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapRemoveEventListenerTest.propTypes = {
  maps: PropTypes.array.isRequired,
  eventListeners: PropTypes.object.isRequired,
  removeEventListenerCallback: PropTypes.func.isRequired
};

export default MapRemoveEventListenerTest;
