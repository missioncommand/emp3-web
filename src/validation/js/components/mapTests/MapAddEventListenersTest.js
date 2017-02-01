import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect, VSelect} from '../shared';

class MapAddEventListenersTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }
    this.state = {
      selectedMapId: selectedMapId,
      selectedEvent: emp3.api.enums.EventType.CAMERA_EVENT,
      eventResultTextArea: ''
    };
    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.updateSelectedEvent = this.updateSelectedEvent.bind(this);
    this.addEventListener = this.addEventListener.bind(this);
    this.clear = this.clear.bind(this);
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
    this.setState({selectedEvent: emp3.api.enums.EventType[event.target.value]});
  }

  addEventListener() {


    if (this.state.selectedMapId === '') {
      toastr.warning('Please select a map first');
      return;
    }

    const {maps, appendEventListenerCallbackMessage, addEventListenerCallback, addResult, addError} = this.props;

    const map = _.find(maps, {geoId: this.state.selectedMapId});
    const args = {
      eventType: this.state.selectedEvent,
      callback: event => {
        let successString;
        let geoIds = [];

        // Needed to list out outputs in a minimalistic fashion for some channels so I could verify the correctness of
        // the event args.
        switch(event.type) {
            case emp3.api.enums.EventType.MAP_VIEW_CHANGE:
              successString = JSON.stringify({
                target: event.target.geoId,
                event: event.event,
                bounds: event.bounds,
                camera: event.camera,
                lookAt: event.lookAt
              }, null, 2);
            break;
            case emp3.api.enums.EventType.MAP_FREEHAND_DRAW_EVENT:
              successString = JSON.stringify({
                target: event.target.geoId,
                event: event.event,
                positionGroup: event.positionGroup,
                style: event.style
              }, null, 2);
              break;
            case emp3.api.enums.EventType.MAP_FEATURE_UPDATED:
              for (var i = 0; i < event.features.length; i++) {
                geoIds.push(event.features[i].geoId);
              }
              successString = JSON.stringify({
                target: event.target.geoId,
                features: geoIds
              }, null, 2);
              break;
            default:
              successString = JSON.stringify(event, null, 2);
        }
        toastr.success(event.type, successString);
        appendEventListenerCallbackMessage(event.type, "\n\n----------------\n" + event.type + "\n----------------\n" + new Date().toTimeString() + ", " + successString);
      }
    };
    try {
      const callback = map.addEventListener(args);
      addEventListenerCallback(args.eventType, callback);
      addResult(args, 'addEventListenerCallback');
      toastr.success('Map addEventListenerCallback Success');
    } catch (err) {
      addError(err.message, 'addEventListenerCallback');
      toastr.error(err.message, 'Map addEventListenerCallback Failed');
    }
  }

  clear() {
    const {clearEventListenerCallbackMessage} = this.props;
    clearEventListenerCallbackMessage();
  }

  render() {
    const {maps, eventListeners} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Subscribe to a Map's Events</span>
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
            id='mapAddEventListeners-event'
            callback={this.updateSelectedEvent}
            values={emp3.api.enums.EventType}
            label="Select which event you'd like to listen to."/>
        </div>
        <button
          className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col"
          disabled={this.state.selectedMapId === ''}
          onClick={this.addEventListener}>
          Subscribe
        </button>

        <div className='mdl-cell mdl-cell--12-col'>
          <label htmlFor="mapAddEventListeners-eventResults">Event Results</label>
          <textarea
            className="mdl-textfield__input"
            type="text"
            rows="10"
            id="mapAddEventListeners-eventResults"
            value={eventListeners.lastMessage}/>
        </div>
        <button
          className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col"
          disabled={this.state.selectedMapId === ''}
          onClick={this.clear}>
          Clear
        </button>
        <div className='mdl-cell mdl-cell--12-col'>
          <RelatedTests relatedTests={[
            {text: 'Unsubscribe to a map event', target: 'mapRemoveEventListenerTest'},
            {text: 'Subscribe to an overlay event', target: 'overlayAddEventListenerTest'},
            {text: 'Subscribe to a feature event', target: 'featureAddEventListenerTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapAddEventListenersTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  addEventListenerCallback: PropTypes.func.isRequired,
  clearEventListenerCallbackMessage: PropTypes.func.isRequired,
  appendEventListenerCallbackMessage: PropTypes.func.isRequired,
  maps: PropTypes.array.isRequired,
  eventListeners: PropTypes.object.isRequired
};

export default MapAddEventListenersTest;
